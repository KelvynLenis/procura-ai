import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../user/get-user-id'

interface CreateContactProps {
  values: {
    contact_name: string
    contact_email?: string
    contact_number: string
  }
}

export async function createContact({ values }: CreateContactProps) {
  try {
    const userId = await getUserId()
    const contactResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_CONTACTS}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          documentId: uuidv4(),
          data: {
            name_contact: values.contact_name,
            email_contact: values.contact_email,
            number_contact: values.contact_number,
            user_id: userId,
          },
        }),
        next: {
          tags: ['contacts'],
        },
      }
    )

    if (!contactResponse.ok) {
      throw new Error('Failed to create contact')
    }

    const contactData = await contactResponse.json()

    return contactData
  } catch (error) {
    console.error('Error in createContact:', error)
  }
}
