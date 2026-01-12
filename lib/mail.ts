import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

/**
 * Singleton mail transporter instance
 */
let transporter: Transporter | null = null;

/**
 * Get mail configuration from environment variables
 */
function getMailConfig(): MailConfig {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    throw new Error(
      "Missing SMTP configuration. Required: SMTP_HOST, SMTP_USER, SMTP_PASS",
    );
  }

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
}

/**
 * Get or create the Nodemailer transporter singleton
 */
export function getTransporter(): Transporter {
  if (!transporter) {
    const config = getMailConfig();
    transporter = nodemailer.createTransport(config);
  }
  return transporter;
}

/**
 * Send an email using the configured transporter
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = getTransporter();
  const from = options.from ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;

  await transport.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    replyTo: options.replyTo,
    cc: options.cc,
    bcc: options.bcc,
    attachments: options.attachments,
  });
}

/**
 * Verify SMTP connection is working
 */
export async function verifyMailConnection(): Promise<boolean> {
  try {
    const transport = getTransporter();
    await transport.verify();
    return true;
  } catch {
    return false;
  }
}
