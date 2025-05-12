export async function getNeighborhoodId(codNeighborhood: number): Promise<string> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: 'cod_neighborhood',
      values: [codNeighborhood],
    }),
  })

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar bairro')
    }

    const result = await response.json()
    if (!result.documents || result.documents.length === 0) {
      throw new Error('Bairro não encontrado')
    }

    return result.documents[0].$id
  } catch (error) {
    console.error('Erro ao buscar bairro:', error)
    throw error
  }
} 