interface UpdateUserStatusData {
    name: string
    email: string
    img_url: string | null
  }
  
  export async function updateUser(userId: string, data: UpdateUserStatusData) {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_USER}/documents/${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
          body: JSON.stringify({
            data,
          }),
        }
      )
  
      if (!response.ok) {
        throw new Error(`Failed to update user: ${await response.text()}`)
      }
  
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      throw error
    }
  }
  