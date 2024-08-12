import { createHash } from "crypto";
import redis from "../config/redis.js";
import TTSService from "./tts.service.js";
import { storage } from "../config/firebase.js";
import env from "../config/env.js";

export default class PhraseService {
  ttsService = new TTSService();
  async storePhrase(text: string) {
    const textHash = createHash("md5").update(text).digest("hex");
    const cacheKey = `voice:${textHash}`;

    // Check if the phrase is already cached
    const cachedUrl = await redis.get(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }

    // generate audio buffer
    const audioBuffer = await this.ttsService.xiLabTTS(text);

    const storageUrl = `https://firebasestorage.googleapis.com/v0/b/${env.FIREBASE.STORAGE_BUCKET}/o`;

    const filename = `voice:${textHash}.mp3`;
    const metadata = {
      metadata: {
        firebaseStorageDownloadTokens: cacheKey,
      },
      contentType: "audio/mp3",
      cacheControl: "public, max-age=31536000",
    };

    await storage.bucket().file(`${filename}`).save(audioBuffer, {
      metadata: metadata,
    });
    const finalUrl = `${storageUrl}/${filename}?alt=media&token=${cacheKey}`;

    await redis.set(cacheKey, finalUrl);
    await redis.expire(cacheKey, 60 * 60 * 1); // 1 hour

    return finalUrl;
  }

  async retrievePhrase(agentName: string, text: string) {
    const textHash = createHash("md5").update(text).digest("hex");
    const cacheKey = `${agentName}:${textHash}`;

    // Retrieve the URL from Redis cache
    return await redis.get(cacheKey);
  }
}
