import { DeviceProps } from '@/types';

export async function listUserDevices(userId: string): Promise<DeviceProps[]> {
  try {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'auth_id',
        values: [userId],
      }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${await response.text()}`);
    }

    const result = await response.json();
    return result.documents || [];
  } catch (error) {
    console.error('Erro ao buscar dispositivos do usuário:', error);
    throw error;
  }
} 