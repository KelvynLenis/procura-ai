import { v4 as uuidv4 } from 'uuid'

interface CreateEventData {
  id_device?: string
  time_event: string
  description?: string
  retrieval_location?: string
  address?: string
  admin_id?: string
  type: string
  is_alert_on: boolean
  last_location: [number, number]
  id_district: string
}

export async function createEvent(data: CreateEventData) {
  const eventId = uuidv4()

  // console.log(`${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_EVENTS}/documents`)

  // console.log('Iniciando criação de evento:', data)
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_EVENTS}/documents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        documentId: eventId,
        data: {
          id_device: data.id_device,
          description: data.description,
          time_event: data.time_event,
          type: data.type,
          last_location: data.last_location,
          is_alert_on: data.is_alert_on,
          id_district: data.id_district
        },
      }),
    }
  )


  if (!response.ok) {
    const errorText = await response.text()
    console.error('Erro na resposta:', errorText)
    throw new Error(`Erro ao criar evento: ${errorText}`)
    // throw new Error(`Failed to create event: ${await response.text()}`)
  }

  const result = await response.json()
  return result
}
