export async function deleteIncidentDraft(draftId: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_INCIDENT_DRAFTS}/documents/${draftId}`,
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
      `Erro ao apagar rascunho de incidente: ${await response.text()}`,
    );
  }
}
