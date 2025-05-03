import { Resend } from 'resend';

interface SendEmailParams {
  subject: string;
  content: string;
  users: { email: string; name?: string }[];
}

// Inicializa o cliente Resend com a chave API do servidor
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function sendEmail({ subject, content, users }: SendEmailParams) {
  try {
    const promises = users.map(async (user) => {
      return resend.emails.send({
        from: 'ProcuraAí <noreply@procuraai.com.br>',
        to: user.email,
        subject: subject,
        html: content,
        text: content.replace(/<[^>]*>/g, ''), // Remove tags HTML para versão texto
      });
    });

    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
}