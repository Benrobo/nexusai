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
  INVALID_FILE_TYPE,
  INVALID_FILE_SIZE,
}

export interface IReqObject {
  user: {
    id: string | null | undefined;
    email?: string;
    role?: string;
  };

  serverUrl?: string;
}

export type AgentType = "ANTI_THEFT" | "AUTOMATED_CUSTOMER_SUPPORT" | "CHATBOT";

export enum AgentEnum {
  ANTI_THEFT = "ANTI_THEFT",
  AUTOMATED_CUSTOMER_SUPPORT = "AUTOMATED_CUSTOMER_SUPPORT",
  CHATBOT = "CHATBOT",
}

export enum KBType {
  TXT = "TXT",
  WEB_PAGES = "WEB_PAGES",
  PDF = "PDF",
  YT_VIDEOS = "YT_VIDEOS",
  NOTION = "NOTION",
}
