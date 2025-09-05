
export async function markNotificationsAsRead(notificationId: string): Promise<{ ok: boolean }> {

  try {  
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION}/documents/${notificationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data: {
            is_read: true
          }
        })
      }
    )
  
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error: ${error}`)
    }
  
    return { ok: response.ok}
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
} 