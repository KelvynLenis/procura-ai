export async function deleteContact(contactId: string) {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_CONTACTS}/documents/${contactId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete contact')
    }
  } catch (error) {
    console.error('Error in deleteContact:', error)
  }
}
