import { Router } from "express";

export interface Routes {
  path: string;
  router: Router;
}

export enum RESPONSE_CODE {
  // Common Responses code
  INVALID_FIELDS,
  DUPLICATE_ENTRY,
  USER_NOT_FOUND,
  USER_ALREADY_EXIST,
  INTERNAL_SERVER_ERROR,
  VALIDATION_ERROR,
  INVALID_PARAMS,
  METHOD_NOT_ALLOWED,
  UNAUTHORIZED,
  FORBIDDEN,
  SUCCESS,
  INVALID_TOKEN,
  ERROR,
  EMAIL_FAILED_TO_SEND,
  GPT_STYLE_NOT_FOUND,
  BAD_REQUEST,
  NOT_FOUND,
  INVALID_OTP,
  OTP_FAILED,
  INVALID_PHONE_NUMBER,
  PHONE_NUMBER_IN_USE,
  UNSUPPORTED_COUNTRY,
}

export interface IReqObject {
  user: {
    id: string | null | undefined;
    email?: string;
    role?: string;
  };

  serverUrl?: string;
}
