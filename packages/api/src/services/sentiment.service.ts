import Sentiment from "sentiment";

export class SentimentAnalysisService {
  sentiment = new Sentiment();

  public async analyzeSentiment(text: string) {
    const result = this.sentiment.analyze(text);
    return result;
  }
}
