export async function getNeighborhood(districtId: string) {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: '$id',
      values: [districtId],
    }),
  })

  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhood: ${await response.text()}`)
    }

    const result = await response.json()

    return result.documents[0]
  } catch (error) {
    console.error(error)
    throw error
  }
} 