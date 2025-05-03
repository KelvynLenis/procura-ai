import * as React from 'react';

interface EmailTemplateProps {
  userName: string;
  deviceModel: string;
  location: string;
  description?: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  userName,
  deviceModel,
  location,
  description,
}) => (
  <div style={{
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  }}>
    <h1 style={{ color: '#002e72' }}>Olá, {userName}!</h1>
    <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
      Seu dispositivo <strong>{deviceModel}</strong> foi recuperado!
    </p>
    <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
      Você pode retirá-lo no seguinte local: <strong>{location}</strong>
    </p>
    {description && (
      <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
        <strong>Informações adicionais:</strong> {description}
      </p>
    )}
    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      <p style={{ color: '#666' }}>Atenciosamente,</p>
      <p style={{ color: '#002e72', fontWeight: 'bold' }}>Equipe ProcuraAí</p>
    </div>
  </div>
);