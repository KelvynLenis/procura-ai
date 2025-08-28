
import { Notification } from "@/interfaces"
import { v4 as uuidv4 } from 'uuid'

export async function createNotification(values: Notification) {
  const notificationId = uuidv4()
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_NOTIFICATION}/documents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        documentId: notificationId,
        data: {
          sender_id: values.sender_id,
          receiver_id: values.receiver_id,
          message: values.message,
          is_read: false,
          type: values.type,
          event_id: values.event_id,
          id_device: values.id_device
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