import type { Event } from '@/types'

export async function listAllEvents(): Promise<Event[]> {
  const allEvents: Event[] = []
  let offset = 0
  const limit = 25
  let total = Number.POSITIVE_INFINITY

  while (offset < total) {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'limit',
        values: [limit],
      }),
      'queries[1]': JSON.stringify({
        method: 'offset',
        values: [offset],
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

      const { documents, total: fetchedTotal } = await response.json()
      allEvents.push(...documents)
      total = fetchedTotal
      offset += limit
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      break
    }
  }

  return allEvents
}
