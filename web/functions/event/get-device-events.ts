import type { Event } from '@/types'

export async function getDeviceEvents(
  deviceId: string,
  isAlertOn?: boolean
): Promise<Event[]> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: 'id_device',
      values: [deviceId],
    }),
    'queries[1]': JSON.stringify({
      method: 'equal',
      attribute: 'is_alert_on',
      values: [isAlertOn !== undefined ? isAlertOn : true],
    }),
    'queries[2]': JSON.stringify({
      method: 'orderDesc',
      attribute: '$createdAt',
    }),
  })

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project':
            process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ao buscar eventos: ${await response.text()}`)
    }

    const { documents } = await response.json()

    return documents
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    throw error
  }
}

export async function getAllDeviceEvents(
  deviceId: string
): Promise<Event[]> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: 'id_device',
      values: [deviceId],
    }),
    'queries[2]': JSON.stringify({
      method: 'orderDesc',
      attribute: '$createdAt',
    }),
  })

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_EVENTS}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project':
            process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Erro ao buscar eventos: ${await response.text()}`)
    }

    const { documents } = await response.json()

    return documents
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    throw error
  }
}
