import { getUserId } from '../user/get-user-id'

interface listContactoParams {
  userIdParam?: string
}

export async function listContacts(props: listContactoParams) {
  try {
    const userId = props.userIdParam ? props.userIdParam : await getUserId()
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'user_id',
        values: [userId],
      }),
    })
    const contactsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_CONTACTS}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        next: {
          tags: ['contacts'],
        },
      }
    )

    if (!contactsResponse.ok) {
      const error = await contactsResponse.text()
      throw new Error(`Error: ${error}`)
    }

    const result = await contactsResponse.json()

    return result.documents
  } catch (error) {
    console.error(error)
  }
}
