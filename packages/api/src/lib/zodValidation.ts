import { RESPONSE_CODE } from "../types/index.js";
import { AnyZodObject, ZodError } from "zod";
import HttpException from "./exception.js";

export default async function ZodValidation(
  schema: AnyZodObject,
  body: object,
  pathname: string
) {
  try {
    const { searchParams } = new URL(pathname);
    const query = searchParams;
    schema.parse(body ?? query);
  } catch (error: any) {
    const issues = error?.issues;
    const msg =
      issues?.length > 0 ? issues[0]?.message : (error?.message as any);
    throw new HttpException(RESPONSE_CODE.VALIDATION_ERROR, msg, 400);
  }
}
