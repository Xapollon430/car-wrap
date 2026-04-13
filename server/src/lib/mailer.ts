import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer/index.js";

export type Mailer = ReturnType<typeof createMailer>;

export type MailerConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
};

export function createMailer(config: MailerConfig) {
  const isConfigured = Boolean(
    config.smtpHost &&
      config.smtpPort &&
      config.smtpUser &&
      config.smtpPass &&
      config.smtpFromEmail,
  );

  const transporter = isConfigured
    ? nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      })
    : null;

  async function send(input: {
    to: string;
    subject: string;
    html: string;
    text: string;
    attachments?: Mail.Attachment[];
  }): Promise<boolean> {
    if (!transporter) {
      return false;
    }

    await transporter.sendMail({
      from: {
        address: config.smtpFromEmail,
        name: config.smtpFromName,
      },
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      attachments: input.attachments,
    });

    return true;
  }

  return {
    isConfigured,
    send,
  };
}
