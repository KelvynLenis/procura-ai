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
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #002e72; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #ffffff; margin: 0; text-align: center;">Dispositivo Recuperado</h1>
        </div>
        
        <div style="color: #333333;">
          <h2 style="color: #002e72;">Olá, ${userName}!</h2>
          
          <p style="font-size: 16px; line-height: 1.5;">
            Temos boas notícias! Seu dispositivo <strong>${deviceModel} / ${deviceBrand}</strong> foi recuperado.
          </p>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #002e72; margin-top: 0;">Local para Retirada:</h3>
            <p style="margin: 0;">${location}</p>
          </div>

          ${description ? `
            <div style="margin-top: 20px;">
              <h3 style="color: #002e72;">Informações Adicionais:</h3>
              <p style="font-size: 16px; line-height: 1.5;">${description}</p>
            </div>
          ` : ''}

          <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            <p style="color: #666666;">Atenciosamente,</p>
            <p style="color: #002e72; font-weight: bold; margin: 0;">Equipe ProcuraAí</p>
          </div>
        </div>
      </div>
    `.trim();

    await this.sendEmail({
      subject: 'Seu dispositivo foi recuperado!',
      content: emailContent,
      users: [{
        email: userEmail,
        name: userName
      }]
    });

    if (emergencyContacts && emergencyContacts.length > 0) {
      for (const contact of emergencyContacts) {
        await this.sendEmail({
          subject: `Dispositivo de ${userName} foi recuperado`,
          content: emailContent,
          users: [{
            email: contact.email,
            name: contact.name
          }]
        });
      }
    }
  }
}; 