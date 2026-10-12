import { getCloudflareContext } from "@opennextjs/cloudflare";

type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendEmailBinding = {
  send(message: {
    to: string;
    from: string | { email: string; name?: string };
    subject: string;
    text: string;
    html?: string;
  }): Promise<unknown>;
};

function getEnvVar(key: string): string | undefined {
  try {
    const context = getCloudflareContext({ async: false });
    const env = context?.env as Record<string, string> | undefined;
    if (env && env[key]) {
      return env[key];
    }
  } catch {
    // Fallback to process.env if outside Cloudflare context
  }
  return process.env[key];
}

export async function sendEmail(input: EmailInput) {
  const cloudflareEmail = getCloudflareEmailBinding();
  const gmailPass = getEnvVar("GMAIL_APP_PASSWORD") || getEnvVar("SMTP_PASS");
  const from = getEnvVar("EMAIL_FROM") || "Goosley <goosleytech@gmail.com>";
  const parsedFrom = parseEmailFrom(from);
  const gmailUser =
    getEnvVar("SMTP_USER") ||
    getEnvVar("GMAIL_USER") ||
    (typeof parsedFrom === "object" ? parsedFrom.email : parsedFrom) ||
    "goosleytech@gmail.com";

  if (gmailPass) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s+/g, ""), // Remove any accidental spaces in Google app password
      },
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return { queued: true, provider: "gmail-smtp" };
  }

  const apiKey = getEnvVar("EMAIL_API_KEY") || getEnvVar("RESEND_API_KEY");

  if (cloudflareEmail) {
    await cloudflareEmail.send({
      from: parsedFrom,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return { queued: true, provider: "cloudflare-email" };
  }

  if (!apiKey) {
    console.info("[email:development]", { from, to: input.to, subject: input.subject });
    return { queued: false, provider: "development-log" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    }),
  });

  if (!response.ok) {
    throw new Error("Email delivery failed");
  }

  return { queued: true, provider: "resend" };
}

function getCloudflareEmailBinding() {
  try {
    const context = getCloudflareContext({ async: false });
    return (context.env as CloudflareEnv & { EMAIL?: SendEmailBinding }).EMAIL;
  } catch {
    return undefined;
  }
}

function parseEmailFrom(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (!match) return value;

  return {
    name: match[1],
    email: match[2],
  };
}
