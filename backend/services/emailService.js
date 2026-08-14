const nodemailer = require('nodemailer');

let transportadorCache = null;

function obterTransportador() {
  if (transportadorCache) return transportadorCache;

  transportadorCache = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined
  });

  return transportadorCache;
}

// Envia (ou, sem SMTP configurado, apenas registra no log do servidor) o link de redefinição de senha.
// Isso mantém o fluxo 100% funcional em desenvolvimento sem exigir credenciais de e-mail reais;
// basta definir SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASSWORD no .env para envio real em produção.
async function enviarEmailRedefinicaoSenha(email, tokenBruto) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const link = `${baseUrl}/redefinir-senha?token=${tokenBruto}`;

  if (!process.env.SMTP_HOST) {
    console.log(`[EMAIL SIMULADO - configure SMTP_HOST para envio real] Redefinição de senha para ${email}: ${link}`);
    return;
  }

  await obterTransportador().sendMail({
    from: process.env.SMTP_FROM || 'ImunoPet Brasil <no-reply@imunopet.com.br>',
    to: email,
    subject: 'Redefinição de senha — ImunoPet Brasil',
    text: `Recebemos uma solicitação para redefinir sua senha. Acesse o link a seguir (válido por 1 hora): ${link}\n\nSe você não solicitou, ignore este e-mail.`,
    html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${link}">Clique aqui para criar uma nova senha</a> (link válido por 1 hora).</p><p>Se você não solicitou, ignore este e-mail.</p>`
  });
}

module.exports = { enviarEmailRedefinicaoSenha };
