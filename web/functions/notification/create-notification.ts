
import { Notification } from "@/types"
import { ID } from "appwrite"

export async function createNotification(values: Notification) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION}/documents`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
      body: JSON.stringify({
        documentId: ID.unique(),
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