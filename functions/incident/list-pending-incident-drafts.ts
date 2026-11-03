import type { IncidentDraft } from "@/types";

export async function listPendingIncidentDrafts(
  authId: string,
): Promise<IncidentDraft[]> {
  const params = new URLSearchParams({
    "queries[0]": JSON.stringify({
      method: "equal",
      attribute: "auth_id",
      values: [authId],
    }),
    "queries[1]": JSON.stringify({
      method: "equal",
      attribute: "status",
      values: ["pending"],
    }),
    "queries[2]": JSON.stringify({
      method: "orderDesc",
      attribute: "$createdAt",
    }),
    "queries[3]": JSON.stringify({
      method: "limit",
      values: [10],
    }),
  });

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_INCIDENT_DRAFTS}/documents?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project":
            process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || "",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(
        `Erro ao listar rascunhos de incidente: ${await response.text()}`,
      );
    }

    const { documents } = await response.json();
    const now = Date.now();

    return (documents as IncidentDraft[]).filter((draft) => {
      if (!draft.expires_at) return true;
      const expiresAt = new Date(draft.expires_at).getTime();
      if (Number.isNaN(expiresAt)) return true;
      return expiresAt > now;
    });
  } catch (error) {
    console.error("Erro ao listar rascunhos de incidente:", error);
    throw error;
  }
}
