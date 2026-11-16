"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { account } from "@/lib/appwrite";
import type { Device, DeviceProps, IncidentDraft } from "@/types";
import { listPendingIncidentDrafts } from "@/functions/incident/list-pending-incident-drafts";
import { clearIncidentOk } from "@/functions/incident/clear-incident-ok";
import { getDeviceById } from "@/functions/device/get-device-by-id";
import {
  mapSuggestedTypeToOccurrenceType,
  toDatetimeLocalValue,
} from "@/functions/incident/map-suggested-type";
import { PendingIncidentModal } from "./PendingIncidentModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { AlertForm } from "./Forms/AlertForm";
import { notifyDevicesChanged } from "@/lib/device-events";

const POLL_INTERVAL_MS = 45_000;

export function PendingIncidentGuard() {
  const [draft, setDraft] = useState<IncidentDraft | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [devices, setDevices] = useState<DeviceProps[]>([]);

  const refreshPendingDraft = useCallback(async () => {
    try {
      const user = await account.get();
      const drafts = await listPendingIncidentDrafts(user.$id);
      const nextDraft = drafts[0] ?? null;

      if (!nextDraft) {
        setDraft(null);
        setDevice(null);
        setIsModalOpen(false);
        return;
      }

      setDraft(nextDraft);

      try {
        const deviceData = await getDeviceById(nextDraft.id_device);
        setDevice(deviceData);
        if (deviceData) {
          setDevices([deviceData as DeviceProps]);
        }
      } catch (error) {
        console.error("Erro ao buscar dispositivo do rascunho:", error);
        setDevice(null);
      }

      if (!isAlertOpen) {
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Erro ao buscar rascunhos de incidente:", error);
    }
  }, [isAlertOpen]);

  useEffect(() => {
    refreshPendingDraft();

    const intervalId = window.setInterval(
      refreshPendingDraft,
      POLL_INTERVAL_MS,
    );

    const handleFocus = () => {
      refreshPendingDraft();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshPendingDraft();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshPendingDraft]);

  async function handleImOk() {
    if (!draft) return;

    try {
      setIsClearing(true);
      await clearIncidentOk({
        draftId: draft.$id,
        deviceId: draft.id_device,
        evidenceUri: draft.evidence_uri,
      });
      setIsModalOpen(false);
      setDraft(null);
      setDevice(null);
      notifyDevicesChanged({
        deviceId: draft.id_device,
        status: "Regular",
        is_stolen: false,
      });
    } catch (error) {
      console.error("Erro ao limpar incidente:", error);
      toast.error("Não foi possível confirmar que está tudo bem. Tente novamente.");
    } finally {
      setIsClearing(false);
    }
  }

  function handleRegisterOccurrence() {
    if (!draft) return;
    setIsModalOpen(false);
    setIsAlertOpen(true);
  }

  function handleAlertClosed(open: boolean) {
    setIsAlertOpen(open);
    if (!open) {
      refreshPendingDraft();
    }
  }

  const initialCoordinates =
    draft?.location && draft.location.length >= 2
      ? ([draft.location[0], draft.location[1]] as [number, number])
      : undefined;

  return (
    <>
      <PendingIncidentModal
        open={isModalOpen && !!draft}
        draft={draft}
        device={device}
        isClearing={isClearing}
        onClose={() => setIsModalOpen(false)}
        onImOk={handleImOk}
        onRegisterOccurrence={handleRegisterOccurrence}
      />

      <Dialog open={isAlertOpen} onOpenChange={handleAlertClosed}>
        <DialogContent className="flex h-[90vh] w-[95vw] max-w-4xl flex-col overflow-y-auto rounded-xl p-0 md:h-fit">
          <DialogHeader className="w-full bg-[#E7F2FE] px-4 py-5">
            <DialogTitle>Criar ocorrência</DialogTitle>
          </DialogHeader>
          {draft && (
            <div className="px-3 py-2 md:px-5">
              <AlertForm
                id={draft.id_device}
                isStolen={true}
                setDevices={setDevices}
                setIsDialogOpen={setIsAlertOpen}
                isPopup
                initialType={mapSuggestedTypeToOccurrenceType(
                  draft.suggested_type,
                )}
                initialDescription={draft.description ?? ""}
                initialDatetime={toDatetimeLocalValue(draft.time_event)}
                initialCoordinates={initialCoordinates}
                draftId={draft.$id}
                evidenceUri={draft.evidence_uri}
                onDraftCleared={() => {
                  setDraft(null);
                  setDevice(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
