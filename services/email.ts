import { emailService as nodemailerService } from './nodemailer';

if (typeof window !== 'undefined') {
  throw new Error('Este módulo só pode ser importado no servidor');
}

interface SendEmailProps {
  subject: string;
  content: string;
  users: Array<{
    email: string;
    name?: string;
  }>;
}

interface DeviceRecoveryEmailProps {
  userName: string;
  userEmail: string;
  deviceModel: string;
  deviceBrand: string;
  location: string;
  description?: string;
  emergencyContacts?: Array<{
    name: string;
    email: string;
  }>;
}

interface VerificationCodeEmailProps {
  userName?: string;
  userEmail: string;
  code: string;
}

const FOOTER_IMAGE_VERIFICATION = 'https://200.129.85.133:8443/v1/storage/buckets/6a2334a100098010118e/files/6a233604002aa8a92904/view?project=6a136b34000bc009056d&mode=admin';
const FOOTER_IMAGE_RECOVERY = 'https://200.129.85.133:8443/v1/storage/buckets/6a2334a100098010118e/files/6a2336000021650a8885/view?project=6a136b34000bc009056d&mode=admin';

type EmailLayoutType = 'verification' | 'recovery';

function getFooterImageByType(type: EmailLayoutType) {
  return type === 'recovery' ? FOOTER_IMAGE_RECOVERY : FOOTER_IMAGE_VERIFICATION;
}

function buildEmailLayout({
  title,
  content,
  type = 'verification',
}: {
  title: string;
  content: string;
  type?: EmailLayoutType;
}) {
  const footerImage = getFooterImageByType(type);

  return `
    <div style="font-family: Arial, sans-serif; width: 100%; margin: 0; padding: 0;">
      <div style="background-color: #0B7AF5; width: 940px; height: 46px; border-radius: 10px; opacity: 1; margin: 40px auto 20px auto; display: flex; align-items: center; justify-content: center; transform: rotate(0deg); text-align: center;">
        <h1 style="color: #ffffff; margin: 0 auto; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 16px; line-height: 46px; letter-spacing: 0%; text-align: center; width: 100%;">${title}</h1>
      </div>

      <div style="color: #232323; width: 940px; margin: 0 auto;">
        ${content}

        <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="color: #232323;">Atenciosamente,</p>
          <p style="color: #232323; font-weight: bold; margin: 0;">Equipe ProcuraAí</p>
        </div>
      </div>
      <div style="width: 940px; margin: 40px auto 0 auto; text-align: center;">
        <img src="${footerImage}" alt="Footer ProcuraAí" style="width: 940px; max-width: 100%; height: auto; display: inline-block; border-radius: 10px;" />
      </div>
    </div>
  `.trim();
}

export const emailService = {
  async sendEmail({ subject, content, users }: SendEmailProps) {

    try {
      return await nodemailerService.sendEmail({
        from: 'ProcuraAí <procuraai.noreply@gmail.com>',
        to: users.map(user => user.email),
        subject,
        html: content,
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  },

  async sendDeviceRecoveryEmail({
    userName,
    userEmail,
    deviceModel,
    deviceBrand,
    location,
    description,
    emergencyContacts,
  }: DeviceRecoveryEmailProps) {
    const content = `
      <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">
        Olá, ${userName}!
      </h2>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
        Informamos que o seu dispositivo <strong>${deviceModel} / ${deviceBrand}</strong> foi recuperado pela Polícia Civil do Estado da Paraíba e já se encontra disponível para retirada.
        Para maior segurança, os seus contatos de confiança já foram comunicados.
      </p>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323;">
        Para fazer a retirada do dispositivo, dirija-se ao local indicado abaixo portando um documento oficial com foto.
      </p>

      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="width: 72px; vertical-align: middle; padding-right: 12px;">
            <img src="https://200.129.85.133:8443/v1/storage/buckets/6a2334a100098010118e/files/6a2335fb00390197c33f/view?project=6a136b34000bc009056d&mode=admin" alt="Ícone de Localização" style="width: 56px; height: 56px; display: block;" />
          </td>
          <td style="vertical-align: top;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
              <h3 style="color: #212A38; margin: 0 0 10px 0; font-family: Roboto, Arial, sans-serif; font-size: 16px;">Local para Retirada</h3>
              <p style="margin: 0; font-family: Roboto, Arial, sans-serif; font-size: 14px; line-height: 150%; color: #232323;">${location}</p>
            </div>
          </td>
        </tr>
      </table>

      ${description ? `
        <div style="margin-top: 20px;">
          <h3 style="color: #212A38; margin: 0 0 10px 0; font-family: Roboto, Arial, sans-serif; font-size: 16px;">Informações Adicionais</h3>
          <p style="font-family: Roboto, Arial, sans-serif; font-size: 14px; line-height: 150%; color: #232323; margin: 0;">${description}</p>
        </div>
      ` : ''}

      <div style="margin-top: 24px;">
        <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 150%; letter-spacing: 0%; color: #232323; margin: 0 0 12px 0;">
          Para mais informações acesse:
          <a href="https://procura-ai.vercel.app/" style="color: #0B7AF5; text-decoration: none;"> https://procura-ai.vercel.app/</a>
          <br />
          Ou baixe nosso aplicativo, disponível nas lojas Google Play e Apple Store.
        </p>
        <img src="https://200.129.85.133:8443/v1/storage/buckets/6a2334a100098010118e/files/6a2335f0003c2cac6d87/view?project=6a136b34000bc009056d&mode=admin" alt="Lojas Disponíveis" style="width: 100%; max-width: 300px; height: auto; display: block; margin: 0; border-radius: 10px;" />
      </div>
    `.trim();

    const emailContent = buildEmailLayout({
      title: "Dispositivo Recuperado",
      content,
      type: 'recovery',
    });

    await this.sendEmail({
      subject: 'Seu dispositivo foi recuperado!',
      content: emailContent,
      users: [{
        email: userEmail,
        name: userName
      }],
    });

    if (emergencyContacts && emergencyContacts.length > 0) {
      for (const contact of emergencyContacts) {
        await this.sendEmail({
          subject: `Dispositivo de ${userName} foi recuperado`,
          content: emailContent,
          users: [{
            email: contact.email,
            name: contact.name
          }],
        });
      }
    }
  },

  async sendVerificationCodeEmail({
    userName,
    userEmail,
    code,
  }: VerificationCodeEmailProps) {
    const displayName = userName?.trim() || "Usuario";

    const content = `
      <h2 style="color: #212A38; font-family: Roboto, Arial, sans-serif; font-weight: 600; font-style: normal; font-size: 20px; line-height: 100%; letter-spacing: 0%;">Olá, ${displayName}!</h2>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 100%; letter-spacing: 0%;">
        Use o código abaixo para continuar o acesso limitado no ProcuraAí.
      </p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <span style="font-size: 40px; font-weight: bold; color: #212A38; letter-spacing: 4px;">${code}</span>
      </div>

      <p style="font-family: Roboto, Arial, sans-serif; font-weight: 400; font-style: normal; font-size: 14px; line-height: 100%; letter-spacing: 0%; color: #232323;">
        Este código expira em 5 minutos. Se você não solicitou este acesso, ignore este e-mail.
      </p>
    `.trim();

    await this.sendEmail({
      subject: `${code} - Código de Verificação | ProcuraAí`,
      content: buildEmailLayout({
        title: "Código de Verificação",
        content,
        type: 'verification',
      }),
      users: [
        {
          email: userEmail,
          name: displayName,
        },
      ],
    });
  },
}; 