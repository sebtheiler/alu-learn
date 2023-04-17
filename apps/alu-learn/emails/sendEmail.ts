import key from "creds/gsuite.json";
import fs from "fs";
import { createTransport } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const EMAIL_FROM = process.env.EMAIL_FROM;
if (!EMAIL_FROM) throw new Error("`.env` must specify `EMAIL_FROM`");

const transporter = createTransport({
  host: process.env.EMAIL_SERVER,
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: EMAIL_FROM,
    serviceClient: key.client_id,
    privateKey: key.private_key,
  },
});

/**
 * Sends an email
 * @see https://medium.com/@imre_7961/nodemailer-with-g-suite-oauth2-4c86049f778a
 * @see https://admin.google.com/ac/owl/domainwidedelegation
 */
const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: {
  /**
   * Comma separated list or an array of recipients' e-mail addresses that will appear on the To: field
   */
  to: string | string[];
  /** The subject of the e-mail */
  subject: string;
  /** The HTML message */
  html?: string;
  /** The raw text message (optional) */
  text?: string;
}): Promise<SMTPTransport.SentMessageInfo | null> => {
  if (process.env.NODE_ENV === "production") {
    await transporter.verify();
    return await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: text ?? "Please use an HTML-enabled client to view this email",
      html,
      list: {
        unsubscribe: {
          url: "https://alulearn.com/settings",
          comment: "Sorry to see you go :(",
        },
      },
    });
  } else {
    const tmpFile = `/tmp/email-${new Date().getTime()}`;
    fs.writeFileSync(
      tmpFile,
      `
=== Begin Email ===
TO: ${to}
Subject: ${subject}
Message: ${text ?? html}
=== End Email ===
`.trim()
    );
    console.log(`Wrote email to file ${tmpFile}`);
    return null;
  }
};

export default sendEmail;
