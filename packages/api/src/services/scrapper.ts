import axios from "axios";
import puppeteer from "puppeteer";
import { RESPONSE_CODE } from "../types/index.js";
import HttpException from "../lib/exception.js";
import TurndownService from "turndown";
import logger from "../config/logger.js";
import * as cheerio from "cheerio";
import { cleanMDV2Prompt } from "../data/agent/prompt.js";
import {
  getLLMResponse,
  type LLMResponseProps,
} from "../helpers/llm.helper.js";
import GeminiService from "./gemini.service.js";

const turndownService = new TurndownService();
const gemini = new GeminiService();
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const getBrowser = () =>
  IS_PRODUCTION
    ? puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      })
    : puppeteer.launch();

/** =========================== NEW IMPLEMENTATION ✅ =========================== **/
export async function scrapeLinksFromWebpage(url: string) {
  try {
    const modifiedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

    // Fetch the HTML content of the page
    const response = await axios.get(modifiedUrl);
    const html = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(html);

    // Extract all links
    const modifiedUrlObj = new URL(modifiedUrl);
    const links = $("a")
      .map((_, element) => {
        const href = $(element).attr("href");
        if (!href) return null;

        try {
          const fullLink = new URL(href, modifiedUrl);
          return fullLink.hostname === modifiedUrlObj.hostname
            ? fullLink.href
            : null;
        } catch {
          return null;
        }
      })
      .get()
      .filter(Boolean);

    const MAX_LINKS = 5; // to limit CF AI usage
    const uniqueLinks = removeDuplicates(links.slice(0, MAX_LINKS));

    console.log(uniqueLinks);

    return uniqueLinks;
  } catch (error) {
    console.error("Error:", error);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting links",
      400
    );
  }
}

export async function scrapeLinksMarkupFromWebpage(url: string) {
  const modifiedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

  // Fetch the HTML content of the page
  const response = await axios.get(modifiedUrl);
  const html = response.data;

  // Load the HTML into Cheerio
  const $ = cheerio.load(html);

  const invalidTags = [
    "script",
    "style",
    "noscript",
    "svg",
    "img",
    "path",
    "input",
    "button",
    "head",
    "meta",
    "link",
    "title",
    "base",
    "basefont",
    "basefont",
    "basefont",
  ];
  invalidTags.forEach((tag) => $(tag).remove());
  const cleanHtml = $("body").html();
  const markdown = turndownService.turndown(cleanHtml);
  return markdown.replace(/\n\s\n+/g, "\n");
}

// using cloudflare qwen chat 14-B model
export async function getCleanMDV2(markdown: string) {
  const prompt = cleanMDV2Prompt(markdown);
  const messages = [
    { role: "system", content: prompt },
  ] as LLMResponseProps["messages"];
  const response = await getLLMResponse(messages);
  return response;
}

// using gemini
export async function getCleanMDV3(markdown: string) {
  const prompt = cleanMDV2Prompt(markdown);
  const resp = await gemini.callAI({
    user_prompt: "",
    instruction: prompt,
  });

  return resp.data;
}

export async function extractLinkMarkupUsingLLMV2(links: string[] = []) {
  logger.info("Extracting link markup using Cheerio");
  let dataMarkup = [] as { url: string; content: string }[];
  try {
    await Promise.all(
      links.map(async (link) => {
        const markup = await scrapeLinksMarkupFromWebpage(link);
        if (markup) {
          const cleanHtml = await getCleanMDV3(markup);
          dataMarkup.push({
            url: link,
            content: cleanHtml,
          });
        }
      })
    );

    return dataMarkup;
  } catch (e: any) {
    console.error("Error:", e?.response?.data ?? e);
    if (dataMarkup.length > 0) return dataMarkup;
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting link markup",
      400
    );
  }
}

/** =========================== END NEW IMPLEMENTATION ✅ =========================== **/

/**
 *
 *
 *
 *
 *
 */

/** =========================== START OLD IMPLEMENTATION ❌ =========================== **/

// Puppeteer-based link scraping. Costly in production due to Chrome instance requirement.
export async function scrapeLinksFromWebpageV1(url: string) {
  try {
    const modifiedUrl = url.endsWith("/") ? url.slice(0, -1) : url;

    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.goto(modifiedUrl, {
      waitUntil: "domcontentloaded",
    });

    const _links = await page.evaluate((baseUrl) => {
      return Array.from(document.querySelectorAll("a"))
        .map((link) => (link as { href: string }).href)
        .filter((link) => link.startsWith(baseUrl));
    }, modifiedUrl);

    await browser.close();

    const MAX_LINKS = 8;
    const uniqueLinks = removeDuplicates(_links.slice(0, MAX_LINKS));

    return uniqueLinks;
  } catch (error) {
    console.error("Error:", error);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting links",
      400
    );
  }
}

export async function extractLinkMarkupUsingLLMV1(links: string[] = []) {
  logger.info("Extracting link markup using LLM");
  let dataMarkup = [] as { url: string; content: string }[];
  try {
    for (const l of links) {
      const md = await getCleanMD(l);
      dataMarkup.push({
        url: l,
        content: md,
      });
    }

    return dataMarkup;
  } catch (e: any) {
    // Partial Degradation
    // If an error occurs, but some data has been scraped, return it
    if (dataMarkup.length > 0) return dataMarkup;

    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting link markup",
      400
    );
  }
}

export async function extractLinkMarkupUsingBrowserV1(links: string[] = []) {
  const browser = await getBrowser();
  let dataMarkup = [] as { url: string; content: string }[];

  for (const link of links) {
    const page = await browser.newPage();
    await page.goto(link);
    // Remove script and style tags
    // get the valid html tags back and not the text content
    const markup = await page.evaluate(() => {
      const invalidTags =
        "script,style,noscript,svg,img,path,input,noscript,button,next-route-announcer,head".split(
          ","
        );
      // remove tag
      for (const tag of invalidTags) {
        const elements = document.querySelectorAll(tag);
        elements.forEach((el) => {
          el.parentNode.removeChild(el);
        });
      }
      return document.body.innerHTML;
    });

    await page.close();

    dataMarkup.push({
      url: link,
      content: turndownService
        .turndown(markup)
        .replace(/\n\s\n+/g, "\n")
        .trim(),
    });
  }

  await browser.close();

  return dataMarkup;
}

// credit: https://github.com/Dhravya/markdowner
// Disclaimer: ❌ Doesn't work in production due to cloudflare firewall or something else i'm not sure of.
export async function getCleanMD(link: string) {
  try {
    const apiUrl = "https://md.dhr.wtf/";
    const req = await axios.get(`${apiUrl}?url=${link}`, {
      timeout: 20000,
    });
    const textresp = req.data;
    return textresp;
  } catch (e: any) {
    console.log(e);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting link markup",
      400
    );
  }
}

// =========================== END OLD IMPLEMENTATION =========================== //

function removeDuplicates(array: string[]) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
