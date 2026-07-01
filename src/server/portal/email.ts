type EmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendEmail(input: EmailInput) {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM || "Goosley <no-reply@goosley.com>";

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

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Recuperacao de acesso Goosley",
    text: `Use este link para redefinir sua senha: ${resetUrl}. Ele expira em 1 hora e so pode ser usado uma vez.`,
    html: `<p>Use este link para redefinir sua senha:</p><p><a href="${resetUrl}">Redefinir senha</a></p><p>O link expira em 1 hora e so pode ser usado uma vez.</p>`,
  });
}
