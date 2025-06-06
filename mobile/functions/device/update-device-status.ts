
interface UpdateDeviceStatusData {
  is_stolen: boolean
  status: string
}

export function getDeviceStatus(type: string): string {
  switch (type) {
    case 'Furto simples':
      return 'Furtado'
    case 'Extravio ou Perda':
      return 'Perdido'
    case 'Roubo':
      return 'Roubado'
    default:
      return 'Desconhecido'
  }
}

export async function updateDeviceStatus(deviceId: string, data: UpdateDeviceStatusData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${deviceId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao atualizar status do dispositivo: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao atualizar status do dispositivo:', error)
    throw error
  }
} 