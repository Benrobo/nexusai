import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import { RESPONSE_CODE } from "../types/index.js";
import HttpException from "../lib/exception.js";
import TurndownService from "turndown";
import { cfQwenChat } from "./cloudflare.service.js";

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

export async function scrapeLinksFromWebpage(url: string) {
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

    const uniqueLinks = removeDuplicates(_links.slice(0, 2));

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

export async function extractLinkMarkup(links: string[] = []) {
  try {
    let dataMarkup = [] as { url: string; content: string }[];
    let idx = 0;
    while (idx < links.length) {
      const link = links[idx];
      const browser = await getBrowser();
      const page = await browser.newPage();

      await page.goto(link, {
        waitUntil: "domcontentloaded",
      });

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

      // get an LLM ready markdown content
      // ! I initially wanted to use this LLM for markdown conversion but it's not working as expected
      // ! The output returned aren't consistent
      //       const qwenData = await cfQwenChat({
      //         custom_prompt: {
      //           prompt: `You are an AI assistant that converts webpage content to markdown while filtering out unnecessary information. Please follow these guidelines:
      // Remove any inappropriate content, ads, or irrelevant information
      // If unsure about including something, err on the side of keeping it
      // Answer in English. Include all points in markdown in sufficient detail to be useful.
      // Aim for clean, readable markdown.
      // Return the markdown and nothing else.`,
      //           messages: [
      //             {
      //               role: "system",
      //               content: `Input: ${markup} Output:\`\`\`markdown\n`,
      //             },
      //           ],
      //         },
      //       });

      dataMarkup.push({
        url: link,
        content: turndownService.turndown(markup),
      });

      await browser.close();

      idx++;
    }

    // remove duplicates from the dataMarkup based on url
    const uniqueDataMarkup = dataMarkup
      .filter((v, i, a) => a.findIndex((t) => t.url === v.url) === i)
      .filter((d) => d.content.length > 0);

    return uniqueDataMarkup;
  } catch (error) {
    console.error("Error:", error);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting links",
      400
    );
  }
}

function removeDuplicates(array: string[]) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
