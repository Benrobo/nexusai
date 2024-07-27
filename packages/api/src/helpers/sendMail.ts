import axios from "axios";
import env from "../config/env.js";

class Resend {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(props: {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
  }) {
    const { from, to, subject, html } = props;
    const api = "https://api.resend.com/emails";
    const res = await axios.post(
      api,
      {
        from,
        to,
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ContentType: "application/json",
        },
      }
    );

    const data = res.data;
    return data;
  }
}

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
    const mailSent = await resend.send({
      from: env.MAIL_FROM,
      to: props.to,
      subject: props.subject,
      html: props.html,
    });

    if (mailSent?.error) {
      console.error("Error sending mail", mailSent.error);
      throw new Error("Error sending mail");
    }
    console.log("Mail sent successfully: ", props.to);
  } catch (error) {
    console.error("Error sending mail", error?.response?.data);
    throw new Error("Error sending mail");
  }
}
