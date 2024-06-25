import { TwilioService } from "./services/twilio.service.js";
import GeminiService from "./services/gemini.service.js";
import fs from "fs";
import {
  extractLinkMarkup,
  scrapeLinksFromWebpage,
} from "./services/scrapper.js";
import { cfQwenChat } from "./services/cloudflare.service.js";

// Test all services without writing test scripts

export default async () => {
  try {
    // TEST ALL SERVICES METHOD
    // const twService = new TwilioService();
    const geminiService = new GeminiService();
    const twService = new TwilioService();

    // const qwenData = await cfQwenChat({});

    // console.log(qwenData);

    const url = "https://trulyao.dev";
    // const links = [
    //   "/",
    //   "/blog",
    //   "/projects",
    //   "/tools",
    //   "/rss.xml",
    //   "/feed.json",
    //   "/tools",
    //   "/blog",
    // ];

    // const url = "https://benrobo.vercel.app";

    // const links = await scrapeLinksFromWebpage(url);
    // const markup = await extractLinkMarkup(url, links);

    // console.log(links);
    // console.log(markup);

    const query = "alumonabenaiah71@gmail.com";
    // const embedding = await geminiService.generateEmbedding(query);

    // // save embedding in .txt file
    // fs.writeFileSync(
    //   "embedding.txt",
    //   JSON.stringify(embedding.map((e) => e.embedding)[0])
    // );

    // if (markup) fs.writeFileSync("markup.json", JSON.stringify(markup));

    // console.log(await twService.getAvailableNumbersForPurchase());

    // console.log(await twService.retrievePhonePrice("US"));

    // await twService.provisionPhoneNumber({
    //   subscription_id: "418270",
    //   user_id: "aPxukqftvAKwNTqZnW2bFG",
    //   phone_number: "+18582074861",
    // });
  } catch (e: any) {
    console.log("\n", e, "\n");
  }
};
