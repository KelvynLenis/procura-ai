import { account } from "@/lib/appwrite";

interface CheckUserStatusResponse {
  status: string;
  isAdmin: boolean;
}

export async function checkUserStatus(
  userId: string,
): Promise<CheckUserStatusResponse> {
  try {
    // Busca o usuário autenticado para verificar os labels
    const authUser = await account.get();

    // Busca o documento do usuário para verificar o status
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "user_id",
        values: [userId],
      }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Erro ao verificar status do usuário");
    }

    const {
      documents: [userDoc],
    } = await response.json();

    if (!userDoc) {
      throw new Error("Usuário não encontrado");
    }

    return {
      status: userDoc.status,
      isAdmin: authUser.labels?.[0] === "admin",
    };
  } catch (error) {
    console.error("Erro ao verificar status do usuário:", error);
    throw error;
  }
}
