import * as sdk from "node-appwrite";

const client = new sdk.Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!)
  .setKey(process.env.NEXT_PUBLIC_APP_WRITE_API_KEY!);

const users = new sdk.Users(client);

export async function deleteUser(userAuthid: string, userDocumentId: string) {
  try {
    // Primeiro deleta as sessões do usuário
    await users.deleteSessions(userAuthid);

    // Depois deleta o usuário da autenticação
    await users.delete(userAuthid);

    // Por fim, deleta o documento do usuário na coleção
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userDocumentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project":
            process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || "",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao deletar documento do usuário: ${await response.text()}`,
      );
    }

    return true;
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    throw error;
  }
}

export async function deleteUserSession(userId: string) {
  const result = await users.deleteSessions(userId);
  return result;
}
