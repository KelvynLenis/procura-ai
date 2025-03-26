import { Device } from '@/types'

export async function createDevice(deviceId: string, values: Device, userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        documentId: deviceId,
        data: {
          phone_number: values.phone_number,
          phone_model: values.phone_model,
          brand: values.brand,
          imei: values.imei,
          is_stolen: false,
          auth_id: userId,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error: ${error}`)
  }

  return response.json()
} 