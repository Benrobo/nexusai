import env from "../config/env.js";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

/**
 *
 * @param to  - email address or array of email addresses
 * @param subject  - email subject
 * @param html  - email body
 */

export default async function sendMail(props: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const mailSent = await resend.emails.send({
      from: env.MAIL_FROM,
      to: props.to,
      subject: props.subject,
      html: props.html,
    });

    if (mailSent?.error) {
      console.error("Error sending mail", mailSent.error);
      throw new Error("Error sending mail");
    }

    console.log(mailSent);
    console.log("Mail sent successfully: ", props.to);
  } catch (error) {
    console.error("Error sending mail", error);
    throw new Error("Error sending mail");
  }
}
