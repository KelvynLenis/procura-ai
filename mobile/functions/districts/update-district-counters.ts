import { District } from "@/interfaces"

export async function updateDistrictCounters(district: District, eventType: string) {
  let data = {}

  switch (eventType) {
    case 'Furto simples':
      data = { theft_counter: district.theft_counter + 1 }
      break
    case 'Extravio ou Perda':
      data = { lost_counter: district.lost_counter + 1 }
      break
    case 'Roubo':
      data = { robbery_counter: district.robbery_counter + 1 }
      break
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DISTRICT}/documents/${district.$id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({ data }),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    throw new Error('Erro ao atualizar contadores do distrito')
  }

  return response.json()
} 