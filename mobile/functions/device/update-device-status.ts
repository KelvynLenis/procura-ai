
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
    case 'Regular':
      return 'Regular'
    default:
      return 'Desconhecido'
  }
}

export async function updateDeviceStatus(deviceId: string, data: UpdateDeviceStatusData) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DEVICE}/documents/${deviceId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data: {
            is_stolen: data.is_stolen,
            status: getDeviceStatus(data.status),
          },
        }),
      }
    )



    if (!response.ok) {
      const errorText = await response.text()
      console.error('Erro na resposta:', errorText)
      throw new Error(`Erro ao criar evento: ${errorText}`)
      // const error = await response.text()
      // throw new Error(`Erro ao atualizar status do dispositivo: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao atualizar status do dispositivo:', error)
    throw error
  }
} 