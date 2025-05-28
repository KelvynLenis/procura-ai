export async function deleteDevice(id: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao deletar dispositivo: ${await response.text()}`);
    }

    return true;
  } catch (error) {
    console.error('Erro ao deletar dispositivo:', error);
    throw error;
  }
} 