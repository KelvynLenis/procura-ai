
export interface District {
  $id: string
  theft_counter: number
  lost_counter: number
  robbery_counter: number
  name_municipality: string
} 

export async function getDistrictId(districtId: string): Promise<District> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: '$id',
      values: [districtId],
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
      throw new Error('Erro ao buscar distrito')
    }

    const result = await response.json()
    return result.documents[0]
  } catch (error) {
    console.error(error)
    throw new Error('Erro ao buscar distrito')
  }
} 