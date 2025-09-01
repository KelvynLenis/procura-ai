
import { Notification } from "@/interfaces"

export async function getNotificationsRead(userId: string): Promise<{ documents: Notification[], total: number}> {

  try {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'receiver_id',
        values: [userId],
      }),
      'queries[1]': JSON.stringify({
        method: 'equal',
        attribute: 'is_read',
        values: [true],
      })
    })
  
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_NOTIFICATION}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        }
      }
    )
  
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error: ${error}`)
    }
  
    const { documents, total} = await response.json()
    
    return {
      documents,
      total
    }
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw error
  }
} 