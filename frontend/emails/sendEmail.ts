import key from "creds/gsuite.json";
import { createTransport } from "nodemailer";

const EMAIL_FROM = process.env.EMAIL_FROM;
if (!EMAIL_FROM) throw new Error("`.env` must specify `EMAIL_FROM`");

const transporter = createTransport({
  host: "smtp.gmail.com",
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
}: {
  /**
   * Comma separated list or an array of recipients' e-mail addresses that will appear on the To: field
   */
  to: string;
  /** The subject of the e-mail */
  subject: string;
  /** The HTML message */
  html: string;
}) => {
  try {
    await transporter.verify();
    await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      text: "Please use an HTML-enabled client to view this email",
      html,
    });
  } catch (e) {
    console.error(e);
  }
};

export default sendEmail;
