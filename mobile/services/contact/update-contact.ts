interface UpdateContactProps {
  values: {
    name_contact: string
    email_contact?: string
    number_contact: string
  }
  id: string
}

export async function updateContact({ values, id }: UpdateContactProps) {
  try {
    const contactResponse = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_CONTACTS}/documents/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data: {
            name_contact: values.name_contact,
            email_contact: values.email_contact,
            number_contact: values.number_contact,
          },
        }),
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
