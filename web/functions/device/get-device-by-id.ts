import { Device } from '@/types'

export async function getDeviceById(id: string): Promise<Device> {
  try {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: '$id',
        values: [id],
      }),
    })
   
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao listar dispositivos: ${error}`)
    }

    const { documents } = await response.json()

    return documents[0]
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error)
    throw error
  }
} 