export interface UpdateDistrictData {
  theft_counter?: number
  lost_counter?: number
  robbery_counter?: number
}

export async function updateDistrict(districtId: string, data: UpdateDistrictData) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DISTRICT}/documents/${districtId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data,
        }),
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update district: ${await response.text()}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error(error)
    throw error
  }
} 