import { NextResponse } from "next/server";
import { sendEmail } from "@/server/portal/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, countryCode, phone, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Por favor, preencha os campos obrigatórios." }, { status: 400 });
    }

    const fullPhone = phone ? `${countryCode || "+55"} ${phone}` : "Não informado";

    const emailContentText = `
Novo Contato Recebido pelo Site Goosley Digital:

Nome: ${name}
E-mail: ${email}
Telefone: ${fullPhone}

Mensagem / Detalhes do Projeto:
${message}
    `.trim();

    const emailContentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #ea580c; border-bottom: 2px solid #ea580c; padding-bottom: 10px;">Novo Contato Recebido - Goosley Digital</h2>
        <p><strong>Nome do Cliente:</strong> ${name}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Telefone / WhatsApp:</strong> ${fullPhone}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <h3 style="color: #333;">Detalhes do Projeto / Mensagem:</h3>
        <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 15px; color: #444;">${message}</p>
      </div>
    `.trim();

    await sendEmail({
      to: "henriquelimagusmao@gmail.com",
      subject: `[Contato Goosley] ${name} - Solicitação de Projeto`,
      text: emailContentText,
      html: emailContentHtml,
    });

    return NextResponse.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail de contato:", error);
    return NextResponse.json({ error: "Falha ao enviar a mensagem." }, { status: 500 });
  }
}
