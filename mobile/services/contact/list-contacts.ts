import { getUserId } from '../user/get-user-id'

export interface Contact {
  $id: string;
  name_contact  : string;
  email_contact: string;
  number_contact: string;
  user_id: string;
  createdAt: string;
}

interface listContactoParams {
  userIdParam?: string
}

export async function listContacts(props: listContactoParams): Promise<Contact[]> {
  try {
    const userId = props.userIdParam ? props.userIdParam : await getUserId()
    console.log('Buscando contatos para o usuário:', userId); // Log para debug

    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'equal',
        attribute: 'user_id',
        values: [userId],
      }),
    })

    const url = `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_CONTACTS}/documents?${params.toString()}`
    console.log('URL da requisição:', url); // Log para debug

    const contactsResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
      },
    })

    if (!contactsResponse.ok) {
      const error = await contactsResponse.text()
      console.error('Erro na resposta da API:', error); // Log para debug
      throw new Error(`Error: ${error}`)
    }

    const result = await contactsResponse.json()
    console.log('Resposta da API:', result); // Log para debug

    if (!result.documents || !Array.isArray(result.documents)) {
      console.error('Formato de resposta inválido:', result); // Log para debug
      return [];
    }

    return result.documents;
  } catch (error) {
    console.error('Erro ao listar contatos:', error)
    return []
  }
}
