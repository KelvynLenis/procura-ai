interface UpdateUserStatusData {
  birthDate: string;
  cep: string;
  address: string;
  address_number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

export async function completeUserData(
  userId: string,
  data: UpdateUserStatusData,
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify({
          data: {
            birth_date: data.birthDate,
            cep: data.cep,
            address: data.address,
            address_number: data.address_number,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            complement: data.complement,
            is_first_login: false,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to update user status: ${await response.text()}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Erro ao atualizar status do usuário:", error);
    throw error;
  }
}
