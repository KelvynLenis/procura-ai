import { storage } from "@/lib/appwrite";

export async function deleteIncidentEvidence(
  evidenceUri?: string | null,
): Promise<void> {
  if (!evidenceUri || !evidenceUri.startsWith("storage:")) {
    return;
  }

  const fileId = evidenceUri.slice("storage:".length).trim();
  if (!fileId) return;

  const bucketId = process.env.NEXT_PUBLIC_INCIDENT_STORAGE_ID;
  if (!bucketId) {
    console.warn(
      "NEXT_PUBLIC_INCIDENT_STORAGE_ID ausente — evidência não removida",
    );
    return;
  }

  try {
    await storage.deleteFile(bucketId, fileId);
  } catch (error) {
    console.error("Erro ao apagar evidência do incidente:", error);
    throw error;
  }
}
