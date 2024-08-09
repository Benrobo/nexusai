import axios from "axios";
import puppeteer from "puppeteer";
import { RESPONSE_CODE } from "../types/index.js";
import HttpException from "../lib/exception.js";
import TurndownService from "turndown";
import logger from "../config/logger.js";
import * as cheerio from "cheerio";

const turndownService = new TurndownService();
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const getBrowser = () =>
  IS_PRODUCTION
    ? // Connect to browserless so we don't run Chrome on the same hardware in production
      puppeteer.connect({
        browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
      })
    : // Run the browser locally while in development
      puppeteer.launch();

// Utilizes puppeteer for link scraping, which was initially problematic in production due to the requirement of a Chrome instance, a setup that would incur additional costs. 😢
export async function scrapeLinksFromWebpageV1(url: string) {
  try {
    // Fetch HTML content of the main page
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

// Optimized code that uses axios and cheerio to scrape the links from the webpage. (not suitable for SPA websites like React, Vue, etc.)
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

    const MAX_LINKS = 8;
    const uniqueLinks = removeDuplicates(links.slice(0, MAX_LINKS));

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

export async function extractLinkMarkupUsingLLM(links: string[] = []) {
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

export async function extractLinkMarkupUsingBrowser(links: string[] = []) {
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

// A fallback function to extract link using @Dhravya markdown cloudflare function
// credit: https://github.com/Dhravya/markdowner
export async function getCleanMD(link: string) {
  try {
    const apiUrl = "https://md.dhr.wtf/";
    const req = await axios.get(`${apiUrl}?url=${link}`, {
      timeout: 20000,
    });
    const textresp = req.data;
    return textresp;
  } catch (e: any) {
    console.log(e?.response?.data ?? e?.message);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting link markup",
      400
    );
  }
}

function removeDuplicates(array: string[]) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
