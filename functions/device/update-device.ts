import { Device } from '@/types'

export async function updateDevice(id: string, values: Device, userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        data: {
          auth_id: userId,
          phone_number: values.phone_number,
          phone_model: values.phone_model,
          brand: values.brand,
          imei: values.imei,
          is_stolen: false,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
} 