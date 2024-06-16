import { TwilioService } from "./services/twilio.service.js";
import GeminiService from "./services/gemini.service.js";
import fs from "fs";

// Test all services without writing test scripts

export default async () => {
  try {
    // TEST ALL SERVICES METHOD
    // const twService = new TwilioService();
    const geminiService = new GeminiService();
    const twService = new TwilioService();

    const query = "alumonabenaiah71@gmail.com";
    // const embedding = await geminiService.generateEmbedding(query);

    // // save embedding in .txt file
    // fs.writeFileSync(
    //   "embedding.txt",
    //   JSON.stringify(embedding.map((e) => e.embedding)[0])
    // );

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
