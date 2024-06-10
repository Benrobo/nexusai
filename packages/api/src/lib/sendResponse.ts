import { Response } from "express";
import { RESPONSE_CODE } from "../types/index.js";

class SendResponse {
  private capitalizeWord(word: string) {
    const capWrd = word.split("")[0].toUpperCase() + word.slice(1);
    return capWrd;
  }

  error(
    res: Response,
    code: RESPONSE_CODE,
    message: string,
    statusCode: number,
    data?: any
  ) {
    return res.status(statusCode).json({
      code: RESPONSE_CODE[code],
      message: message ?? this.capitalizeWord("error-message"),
      data,
    });
  }

  success(
    res: Response,
    code: RESPONSE_CODE,
    message: string,
    statusCode: number,
    data?: any
  ) {
    return res.status(statusCode).json({
      code: RESPONSE_CODE[code],
      message: message ?? this.capitalizeWord("success-message"),
      data: data ?? null,
    });
  }
}

const sendResponse = new SendResponse();
export default sendResponse;
