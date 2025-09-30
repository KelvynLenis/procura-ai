
import { Notification } from "@/types"

export async function getPushNotificationHistory(): Promise<Notification[]> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: 'type',
      values: ['push'],
    })
  })
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION}/documents?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Error: ${error}`)
  }

  const data = await response.json()
  
  return data.documents
} 