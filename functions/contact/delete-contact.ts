export async function deleteContact(contactId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_CONTACTS}/documents/${contactId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete contact");
    }
  } catch (error) {
    console.error("Error in deleteContact:", error);
  }
}
