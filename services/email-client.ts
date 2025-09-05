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

export const emailClient = {
  async sendDeviceRecoveryEmail(params: DeviceRecoveryEmailProps) {
    const response = await fetch('/api/notify-device-recovery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar notificação');
    }

    return response.json();
  }
}; 