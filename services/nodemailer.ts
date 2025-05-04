import nodemailer from 'nodemailer';

const isServer = typeof window === 'undefined';

interface EmailConfig {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (!isServer) {
      throw new Error('EmailService só pode ser inicializado no servidor');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // Senha de aplicativo do Google
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendEmail({ from, to, subject, html, text }: EmailConfig) {
    try {
      const mailOptions = {
        from,
        to: to.join(', '),
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Remove tags HTML se text não for fornecido
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', info.messageId);
      return info;
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }
  }

  async verifyConnection() {
    try {
      const verification = await this.transporter.verify();
      console.log('Conexão com servidor de email verificada:', verification);
      return verification;
    } catch (error) {
      console.error('Erro ao verificar conexão com servidor de email:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService(); 