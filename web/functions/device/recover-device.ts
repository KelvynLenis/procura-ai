import { createEvent } from '../event/create-event';
import { updateDeviceStatus } from './update-device-status';

interface RecoveryDeviceData {
  is_stolen: boolean;
  status: string;
}

export async function recoverDevice(id: string): Promise<boolean> {
  try {
    const eventData = {
      id_device: id,
      time_event: new Date().toISOString(),
      last_location: [0, 0] as [number, number],
      description: 'Recuperado',
      type: 'Recuperado',
      is_alert_on: false,
      id_district: '', // TODO: Adicionar id do distrito se necessário
    };

    const eventCreated = await createEvent(eventData);
    if (!eventCreated) {
      throw new Error('Falha ao criar evento de recuperação');
    }

    const recoveryData = {
      is_stolen: false,
      status: 'Recuperado',
    };

    const deviceUpdated = await updateDeviceStatus(id, recoveryData);
    if (!deviceUpdated) {
      throw new Error('Falha ao atualizar status do dispositivo');
    }

    return true;
  } catch (error) {
    console.error('Erro ao recuperar dispositivo:', error);
    return false;
  }
} 