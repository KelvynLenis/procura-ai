export async function deleteContactByUserId(userId: string) {
  try {
    // Buscar documento
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "user_id",
        values: [userId],
      }),
    });

    const findResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_CONTACTS}/documents?${params}`,
      {
        headers: {
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!,
        },
      },
    );

    const data = await findResponse.json();

    if (!data.documents?.length) {
      return true;
    }

    for (let i = 0; i < data.documents.length; i++) {
      const documentId = data.documents[i].$id;
      const deleteResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_CONTACTS}/documents/${documentId}`,
        {
          method: "DELETE",
          headers: {
            "X-Appwrite-Project": process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!,
          },
        },
      );

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete contact");
      }
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
