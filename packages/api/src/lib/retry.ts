import prisma from "../prisma/prisma.js";
import logger from "../config/logger.js";
import sendMail from "../helpers/sendMail.js";

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
        if (functionName === "ProvisionPhoneNumber") {
          // send an email to the
          const user = await prisma.users.findFirst({
            where: { uId: args[0].user_id },
          });
          if (user) {
            const mailTemplate = `
              <p>Hi ${user.email},</p>
              <p>Provisioning of phone number for your subscription failed after ${retries} attempts. Please contact support at alumonabenaiah71@gmail.com for assistance.</p>
              <p>Thank you.</p>
            `;
            await sendMail({
              to: user.email,
              subject: "🚨 Provisioning of Phone Number Failed",
              html: mailTemplate,
            });
          }
        }
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
