import axios from "axios";
import cheerio from "cheerio";
import puppeteer from "puppeteer";
import { RESPONSE_CODE } from "../types/index.js";
import HttpException from "../lib/exception.js";
import TurndownService from "turndown";

const turndownService = new TurndownService();

export async function scrapeLinksFromWebpage(url: string) {
  try {
    // Fetch HTML content of the main page
    const modifiedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    const response = await axios.get(modifiedUrl);
    const html = response.data;

    // Use Puppeteer to execute JavaScript and retrieve dynamic content
    const IS_PRODUCTION = process.env.NODE_ENV === "production";
    const getBrowser = () =>
      IS_PRODUCTION
        ? // Connect to browserless so we don't run Chrome on the same hardware in production
          puppeteer.connect({
            browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_API_KEY}`,
          })
        : // Run the browser locally while in development
          puppeteer.launch();
    const browser = await getBrowser();

    // Continue with cheerio for server-side HTML parsing
    const $ = cheerio.load(html);

    // Extract all anchor tags
    const links = $("a")
      .map((_, element) => $(element).attr("href"))
      .get()
      .filter(
        (link) =>
          link &&
          !link.includes("https") &&
          link.startsWith("/") &&
          !link.includes("#")
      )
      .slice(0, 8); // only scrape 8 links

    // Fetch links content
    const _links = [] as any;

    // include the homepage url along side.
    // const allLinks = await Promise.all(
    //   removeDuplicates(["/", ...links]).map(async (link) => {
    //     const _url = `${modifiedUrl}${link}`;

    //     const page = await browser.newPage();

    //     await page.goto(_url, { waitUntil: "domcontentloaded" });

    //     await sleep(2000);

    //     const updatedHtml = await page.content();
    //     const _$ = cheerio.load(updatedHtml);

    //     // Remove script and style tags
    //     const invalidTags =
    //       "script,style,svg,img,path,input,noscript,next-route-announcer,head".split(
    //         ","
    //       );

    //     invalidTags.forEach((tag) => {
    //       _$(`${tag}`).remove();
    //     });

    //     const validTags = _$("*")
    //       .not(`:is(${invalidTags.join(",")})`)
    //       .filter(
    //         (_, element) =>
    //           $(element).html() !== undefined || $(element).text() !== ""
    //       ); // filter tag if it has html and textContent available

    //     validTags.each((_, element) => {
    //       const textContent = $(element)
    //         .contents() // Get all child nodes
    //         .map((_, node) => $(node).text()) // Map to text content of each node
    //         .get() // Convert to array
    //         .join(" ") // Join the text content
    //         .trim(); // Trim leading and trailing whitespaces

    //       _links.push({
    //         url: _url,
    //         content: textContent,
    //       });
    //     });
    //   })
    // );

    await browser.close();

    // extract non duplicate links if exists
    const nonDuplicateLinks = links.filter(
      (link: any, index: number, self: any) =>
        index === self.findIndex((t: any) => t.url === link.url)
    );

    return links;
  } catch (error) {
    console.error("Error:", error);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting links",
      400
    );
  }
}

export async function extractLinkMarkup(url: string, path: string[] = []) {
  try {
    let dataMarkup = [] as { url: string; content: string }[];
    for (const p of path) {
      const cleanedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
      const combinedUrl = `${cleanedUrl}${p}`;
      const response = await axios.get(combinedUrl);
      const html = response.data;

      const $ = cheerio.load(html);

      // Remove script and style tags
      const invalidTags =
        "script,style,svg,img,path,input,noscript,next-route-announcer,head".split(
          ","
        );

      invalidTags.forEach((tag) => {
        $(`${tag}`).remove();
      });

      const validTags = $("*")
        .not(`:is(${invalidTags.join(",")})`)
        .filter(
          (_, element) =>
            $(element).html() !== undefined || $(element).text() !== ""
        ); // filter tag if it has html and textContent available

      // get the valid html tags back and not the text content
      const markup = validTags.map((_, element) => $(element).html()).get();

      dataMarkup.push({
        url: combinedUrl,
        content: turndownService.turndown(markup.join(" ")),
      });
    }

    return dataMarkup;
  } catch (error) {
    console.error("Error:", error);
    throw new HttpException(
      RESPONSE_CODE.EXTRACT_LINKS_ERROR,
      "Error extracting links",
      400
    );
  }
}

function removeDuplicates(array: any[]) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
