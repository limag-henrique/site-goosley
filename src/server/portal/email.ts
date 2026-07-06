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

async function sendEmail(input: EmailInput) {
  const cloudflareEmail = getCloudflareEmailBinding();
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM || "Goosley <goosleytech@gmail.com>";

  if (cloudflareEmail) {
    await cloudflareEmail.send({
      from: parseEmailFrom(from),
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

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Recuperacao de acesso Goosley",
    text: `Use este link para redefinir sua senha: ${resetUrl}. Ele expira em 1 hora e so pode ser usado uma vez.`,
    html: `<p>Use este link para redefinir sua senha:</p><p><a href="${resetUrl}">Redefinir senha</a></p><p>O link expira em 1 hora e so pode ser usado uma vez.</p>`,
  });
}
