import { updateDeviceStatus } from "@/functions/device/update-device-status";
import { deleteIncidentDraft } from "./delete-incident-draft";
import { deleteIncidentEvidence } from "./delete-incident-evidence";

interface ClearIncidentOkParams {
  draftId: string;
  deviceId: string;
  evidenceUri?: string | null;
}

export async function clearIncidentOk({
  draftId,
  deviceId,
  evidenceUri,
}: ClearIncidentOkParams): Promise<void> {
  await deleteIncidentDraft(draftId);

  try {
    await deleteIncidentEvidence(evidenceUri);
  } catch (error) {
    console.error(
      "Falha ao remover evidência após limpar rascunho:",
      error,
    );
  }

  if (deviceId) {
    await updateDeviceStatus(deviceId, {
      is_stolen: false,
      status: "Regular",
    });
  }
}
