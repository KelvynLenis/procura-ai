import { User } from "@/types";

export async function getUserByCPF(cpf: string): Promise<User> {
  try {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "cpf",
        values: [cpf],
      }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error: ${error}`);
    }

    const data = await response.json();
    return data.documents[0] as User;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
}
