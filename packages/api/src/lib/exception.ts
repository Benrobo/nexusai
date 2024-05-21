import { RESPONSE_CODE } from "../types";

export default class HttpException extends Error {
  public code: RESPONSE_CODE;
  public statusCode: number;
  constructor(code: RESPONSE_CODE, message: string, statusCode: number) {
    super();
    this.name = "HttpException";
    this.code = code;
    this.message = message;
    this.statusCode = statusCode;
  }
}
