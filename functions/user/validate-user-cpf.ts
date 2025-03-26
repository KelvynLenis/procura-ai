export async function validateUserCpf(cpf: string): Promise<boolean> {
  const params = new URLSearchParams({
    'queries[0]': JSON.stringify({
      method: 'equal',
      attribute: 'cpf',
      values: [cpf],
    }),
  })

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      }
    )
    if (!response.ok) {
      throw new Error('Erro ao verificar CPF')
    }

    const existingUsers = await response.json()
    return !existingUsers.documents.some(
      (existingUser: any) => existingUser.cpf === cpf
    )
  } catch (error) {
    console.error('Erro ao verificar CPF:', error)
    throw error
  }
} 