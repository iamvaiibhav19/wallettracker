import nodemailer from "nodemailer";
import logger from "./logger";

export const sendEmail = async (emails: string[], subject: string, body: string) => {
  // ENV variables
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT!);
  const ssl = process.env.EMAIL_SSL === "true";
  const user = process.env.EMAIL_USER!;
  const pass = process.env.EMAIL_PASS!;

  // Configure transporter
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: ssl,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from: `Wallet Tracker <${user}>`,
    to: emails.join(", "),
    subject,
    text: body,
  };

  try {
    logger.info(`Attempting to send email to: ${emails.join(", ")}`);
    await transporter.sendMail(mailOptions);
    logger.info("Email sent successfully.");
  } catch (error: any) {
    logger.error(`Failed to send email. Error: ${error.message}`);
    throw new Error("Error sending email");
  }
};
