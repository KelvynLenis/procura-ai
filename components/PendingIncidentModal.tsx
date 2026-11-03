"use client";

import { AlertTriangle } from "lucide-react";
import type { Device, IncidentDraft } from "@/types";
import { formatDateTime } from "@/lib/utils";
import Button from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  mapSuggestedTypeToOccurrenceType,
} from "@/functions/incident/map-suggested-type";

interface PendingIncidentModalProps {
  open: boolean;
  draft: IncidentDraft | null;
  device: Device | null;
  isClearing: boolean;
  onClose: () => void;
  onImOk: () => void;
  onRegisterOccurrence: () => void;
}

function formatDraftDate(value?: string | null) {
  if (!value) return "—";
  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) return value;
  return formatDateTime(value) || "—";
}

function formatLocation(location?: number[] | null) {
  if (!location || location.length < 2) return "—";
  return `${location[0]}, ${location[1]}`;
}

export function PendingIncidentModal({
  open,
  draft,
  device,
  isClearing,
  onClose,
  onImOk,
  onRegisterOccurrence,
}: PendingIncidentModalProps) {
  const deviceLabel = device
    ? `${device.brand} / ${device.phone_model}`
    : "seu dispositivo";

  const suggestedType =
    mapSuggestedTypeToOccurrenceType(draft?.suggested_type) ||
    draft?.suggested_type ||
    "—";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="w-[95vw] max-w-md gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-3 px-6 pb-2 pt-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-semibold text-[#212A38]">
            Está tudo bem com você?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-zinc-600">
            Detectamos atividade suspeita no dispositivo{" "}
            <strong>{deviceLabel}</strong>. Isso pode indicar um possível furto
            ou roubo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 pt-2">
          <div className="rounded-xl bg-[#C4F3F2] p-4 text-left text-sm text-[#212A38]">
            <p className="mb-2">
              <strong>Ocorrência sugerida:</strong> {suggestedType}
            </p>
            <p className="mb-2">
              <strong>Data:</strong> {formatDraftDate(draft?.time_event)}
            </p>
            <p>
              <strong>Local aproximado:</strong>{" "}
              {formatLocation(draft?.location)}
            </p>
          </div>

          <p className="text-center text-sm text-zinc-600">
            Se você foi furtado ou roubado, confirme a ocorrência.
          </p>

          <div className="flex w-full gap-4">
            <Button
              type="button"
              variant="white"
              className="w-full flex-1 text-sm"
              disabled={isClearing}
              onClick={onImOk}
            >
              {isClearing ? "Processando..." : "Estou bem"}
            </Button>
            <Button
              type="button"
              variant="blue"
              className="w-full flex-1 self-center text-sm"
              disabled={isClearing}
              onClick={onRegisterOccurrence}
            >
              Cadastrar ocorrência
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
