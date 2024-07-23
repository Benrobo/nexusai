import type { Readable } from "stream";
import env from "../config/env.js";
import axios from "axios";

export default class TTSService {
  private elevenlabs: ElevenLabsClient;

  constructor() {
    this.elevenlabs = new ElevenLabsClient({
      apiKey: env.TTS.XI_LAB_API_KEY,
    });
  }

  async xiLabTTS(text: string) {
    console.log("🔃 TEXT-TO-SPEECH Conversion in progress...");
    const natasha_voiceId = "yFoRLlziakxvS8XqPKQF";
    const response = await this.elevenlabs.textToSpeech({
      text,
      model_id: "eleven_turbo_v2",
      voiceId: natasha_voiceId,
    });

    console.log("TEXT-TO-SPEECH Conversion done ✅");

    const audioBuffer = Buffer.from(response, "binary");
    return audioBuffer;
  }
}

interface ElevenLabsTTS {
  voiceId: string;
  model_id: string;
  text: string;
  output_format?: string;
}

export class ElevenLabsClient {
  private apiKey: string;
  private baseUrl: string;

  constructor({ apiKey }: { apiKey: string }) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.elevenlabs.io/v1";
  }

  async textToSpeech({
    voiceId,
    model_id = "eleven_multilingual_v2",
    text,
    output_format,
  }: ElevenLabsTTS) {
    try {
      const response = await axios({
        method: "POST",
        url: `${this.baseUrl}/text-to-speech/${voiceId}`,
        data: {
          text,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75,
            use_speaker_boost: true,
            output_format,
          },
          model_id,
        },
        headers: {
          Accept: "audio/mpeg",
          "xi-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      });

      return response.data;
    } catch (e: any) {
      console.log(e?.response);
      throw new Error(`ElevenLabs TTS Error: ${e.message}`);
    }
  }
}
