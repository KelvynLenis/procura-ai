import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../user/get-user-id'

interface CreateContactProps {
  values: {
    name_contact: string
    email_contact?: string
    number_contact: string
  }
}

export async function createContact({ values }: CreateContactProps) {
  try {
    const userId = await getUserId()
    const contactResponse = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_CONTACTS}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          documentId: uuidv4(),
          data: {
            name_contact: values.name_contact,
            email_contact: values.email_contact,
            number_contact: values.number_contact,
            user_id: userId,
          },
        }),
      }
    )

    console.log('contactResponse', contactResponse)

    if (!contactResponse.ok) {
      throw new Error('Failed to create contact')
    }

    const contactData = await contactResponse.json()

    return contactData
  } catch (error) {
    console.error('Error in createContact:', error)
  }
}
