import { User } from '@/interfaces'

export async function getUserById(id: string): Promise<User> {
  try {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'user_id',
        values: [id],
      }),
    })
   
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao listar dispositivos: ${error}`)
    }

    const { documents } = await response.json()

    // console.log(documents)

    return documents[0]
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error)
    throw error
  }
} 