
interface ListDevicesParams {
  userId: string
  limit: number
  page: number
  isAdmin?: boolean
}

export async function listDevices({ userId, limit, page, isAdmin }: ListDevicesParams) {
  try {
    const queries = []

    // Se não for admin, filtra por userId
    if (!isAdmin) {
      queries.push({
        method: 'equal',
        attribute: 'auth_id',
        values: [userId],
      })
    }

    queries.push(
      {
        method: 'limit',
        values: [limit],
      },
      {
        method: 'offset',
        values: [(page - 1) * limit],
      }
    )

    const params = new URLSearchParams()
    queries.forEach((query, index) => {
      params.append(`queries[${index}]`, JSON.stringify(query))
    })

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
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

    return await response.json()
  } catch (error) {
    console.error('Erro ao listar dispositivos:', error)
    throw error
  }
} 