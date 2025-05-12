
interface CreateUserData {
  userId: string
  name: string
  cpf: string
  email: string
  password: string

}

export async function createUser(data: CreateUserData): Promise<CreateUserData> {
  try {
    const createdUser = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/account`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          userId: data.userId,
          email: data.email,
          password: data.password,
        }),
      }
    )

    if (!createdUser.ok) {
      const error = await createdUser.text()
      throw new Error(`Erro ao criar conta: ${error}`)
    }

    const authUser = await createdUser.json()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          documentId: data.userId,
          data: {
            user_id: authUser.$id,
            name: data.name,
            cpf: data.cpf,
            email: data.email,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Erro ao criar usuário: ${error}`)
    }

    return response.json()
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    throw error
  }
} 