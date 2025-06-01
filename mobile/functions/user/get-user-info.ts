export async function getUserInfo(auth_id: string) {
  const allUsers = []
  let offset = 0
  const limit = 25
  let total = Number.POSITIVE_INFINITY

  while (offset < total) {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'user_id',
        values: [auth_id],
      }),
    })
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
          cache: 'no-store',
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to fetch user info: ${error}`)
      }
      const { documents, total: fetchedTotal } = await response.json()
      allUsers.push(...documents)
      total = fetchedTotal
      offset += limit
    } catch (error) {
      console.error(error)
      break
    }
  }
  return allUsers
}
