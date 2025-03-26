import { Event } from '@/types'

export async function getDeviceEvents(deviceId: string): Promise<Event[]> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: 'id_device',
      values: [deviceId],
    }),
    'queries[1]': JSON.stringify({
      method: 'equal',
      attribute: 'is_alert_on',
      values: [true],
    }),
  })

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ao buscar eventos: ${await response.text()}`)
    }

    const { documents } = await response.json()

    // Ordena os eventos por data de criação (mais recente primeiro)
    return documents.sort(
      (a: Event, b: Event) =>
        new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    )
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    throw error
  }
} 