import { GoogleGenerativeAI } from "@google/generative-ai";
import env from "../config/env.js";

// Google Gemini Service

export default class GeminiService {
  private genAI: GoogleGenerativeAI;
  constructor() {
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async generateEmbedding(data: string) {
    if (!data) {
      throw new Error("Data is required");
    }

    const model = this.genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(data);
    const embedding = result.embedding.values;
    return embedding;
  }
}
