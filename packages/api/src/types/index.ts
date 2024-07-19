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
  AGENT_ALREADY_LINKED,
  ERROR_CREATING_CHECKOUT,
  ERROR_PROVISIONING_NUMBER,
  INVALID_HANDOVER_CONDITION,
  EXTRACT_LINKS_ERROR,
  GENERATIVE_AI_ERROR,
  CONVERSATION_NOT_ESCALATED,
  CONVERSATION_ESCALATED,
  OTP_CODE_REQUESTED,
  QUERY_ALREADY_PROCESSED,
}

export interface IReqObject {
  user: {
    id: string | null | undefined;
    email?: string;
    role?: string;
  };

  serverUrl?: string;
}

export type AgentType = "ANTI_THEFT" | "SALES_ASSISTANT" | "CHATBOT";

export enum AgentEnum {
  ANTI_THEFT = "ANTI_THEFT",
  SALES_ASSISTANT = "SALES_ASSISTANT",
  CHATBOT = "CHATBOT",
}

export enum KBType {
  TXT = "TXT",
  WEB_PAGES = "WEB_PAGES",
  PDF = "PDF",
  YT_VIDEOS = "YT_VIDEOS",
  NOTION = "NOTION",
}

export interface TwilioIncomingCallVoiceResponse {
  Called: string;
  ToState: string;
  CallerCountry: string;
  Direction: "inbound" | "outbound";
  CallerState: string;
  ToZip: string;
  CallSid: string;
  To: string;
  CallerZip: string;
  SpeechResult?: string;
  ToCountry: string;
  StirVerstat: string;
  CallToken: string;
  CalledZip: string;
  ApiVersion: string;
  CalledCity: string;
  CallStatus: string;
  From: string;
  AccountSid: string;
  CalledCountry: string;
  CallerCity: string;
  ToCity: string;
  FromCountry: string;
  Caller: string;
  FromCity: string;
  CalledState: string;
  FromZip: string;
  FromState: string;
}
