import { TwilioService } from "./services/twilio.service.js";
import GeminiService from "./services/gemini.service.js";
import fs, { createWriteStream } from "fs";
import { scrapeLinksFromWebpage } from "./services/scrapper.js";
import { cfQwenChat } from "./services/cloudflare.service.js";
import TTSService from "./services/tts.service.js";
import shortUUID from "short-uuid";
import { createHash } from "crypto";
import PhraseService from "./services/phrase.service.js";
import redis from "./config/redis.js";
import LemonsqueezyServices from "./services/LS.service.js";
import sendMail from "./helpers/sendMail.js";
import BackgroundJobService from "./services/background-job.service.js";

// Test all services without writing test scripts

export default async () => {
  try {
    // TEST ALL SERVICES METHOD
    // const twService = new TwilioService();
    // const twService = new TwilioService();
    const phraseService = new PhraseService();
    const tts = new TTSService();
    const LS = new LemonsqueezyServices();
    const job = new BackgroundJobService();

    // await job.publishJob({
    //   type: "send-sms",
    //   data: {
    //     from: "+18582074861",
    //     to: "+13234808961",
    //     message: "Hello, this is a test message",
    //   },
    // });

    // await sendMail({
    //   to: "alumonabenaiah71@gmail.com",
    //   subject: "Test Email",
    //   html: "<h1>Hello, this is a test email</h1>",
    // });

    try {
      // console.log(await LS.getStoreInfo());
      // const resp = await tts.xiLabTTS(
      //   "Hello, this is a test. How are you today? I hope you're doing well."
      // );
      // const upload = await phraseService.storePhrase(
      //   "agent-1",
      //   "Hello, this is a test. How are you today? I hope you're doing well.",
      //   resp
      // );
      // console.log(upload);
    } catch (e: any) {
      console.log(e);
    }

    // console.log(resp);

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
