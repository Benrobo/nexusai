import logger from "../config/logger.js";

interface RetryParams<F extends (...args: any[]) => Promise<any>> {
  fn: F;
  args: Parameters<F>;
  functionName: string;
  retries?: number;
}
/**
 *
 * @param fn: Async function to retry
 * @param args: Arguments to pass to the function
 * @param functionName: Name of the function
 * @param retries (optional): Number of retries
 * @returns
 */

export default async function retry<
  F extends (...args: any[]) => Promise<any>,
>({ fn, args, functionName, retries = 3 }: RetryParams<F>) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn(...args);
    } catch (error) {
      attempt++;
      if (attempt >= retries) {
        logger.error(
          `Function "${functionName}" failed after ${retries} attempts: ${error}`
        );
        return;
      }
      logger.error(
        `Function "${functionName}" attempt ${attempt} failed. Retrying...`
      );
    }
  }
}
