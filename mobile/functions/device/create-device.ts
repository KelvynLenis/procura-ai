import { CreateDevice, Device } from "@/interfaces"
import { getUserId } from "../user/get-user-id"

export async function createDevice(deviceId: string, values: CreateDevice) {
  const userId = await getUserId()
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DEVICE}/documents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
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
          operator_id: values.operator_id
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