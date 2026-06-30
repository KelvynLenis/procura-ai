export async function deleteUser(id: string, userDocumentId: string) {
  try {
    const responseDeleteAuth = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
          "X-Appwrite-Key": `${process.env.NEXT_PUBLIC_APP_WRITE_API_KEY}`,
        },
      },
    );

    if (!responseDeleteAuth.ok) {
      const error = await responseDeleteAuth.text();
      throw new Error(`Error: ${error}`);
    }

    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "user_id",
        values: [id],
      }),
    });

    const responseDeleteDocument = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents/${userDocumentId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!responseDeleteDocument.ok) {
      const error = await responseDeleteDocument.text();
      throw new Error(`Error: ${error}`);
    }

    return true;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw error;
  }
}
