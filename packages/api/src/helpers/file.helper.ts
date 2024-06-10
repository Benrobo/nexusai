import HttpException from "../lib/exception.js";
import { RESPONSE_CODE } from "../types/index.js";
import * as pdfjslib from "pdfjs-dist/legacy/build/pdf.mjs";

export class FileHelper {
  public async extractText(pdf: Buffer) {
    // extract text from pdf
  }

  public validateFileType(mimeType: string, validMimeType: string[]) {
    if (!validMimeType.includes(mimeType)) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_FILE_TYPE,
        `Invalid file type, only ${validMimeType.join(", ")} allowed`,
        400
      );
    }
  }

  public validSize(size: number, maxSize: number) {
    if (size > maxSize) {
      throw new HttpException(
        RESPONSE_CODE.INVALID_FILE_SIZE,
        `File size should not exceed ${maxSize / 1024 / 1024} MB`,
        400
      );
    }
  }

  public async extractPdfText(file: Uint8Array) {
    const pdf = await pdfjslib.getDocument(file).promise;
    const pages = pdf.numPages;
    let text = "";
    for (let i = 1; i <= pages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => (item as any)?.str).join(" ");
    }
    return text;
  }
}
