"use client";

import { TableCell, TableRow } from "../ui/table";
import type { OccurrencesProps } from "@/types";
import { cn } from "@/lib/utils";
import { RecoverDeviceForm } from "../Forms/RecoverDeviceForm";
import recoveryIcon from "../../assets/icons/recover.png";
import { OccurrenceDetails } from "../OccurrenceDetails";
import Image from "next/image";
import { useState } from "react";

interface AlertRowProps {
  index: number;
  occurrence?: OccurrencesProps;
  setOccurrences: React.Dispatch<React.SetStateAction<OccurrencesProps[]>>;
}

export function AlertRow({ index, occurrence, setOccurrences }: AlertRowProps) {
  return (
    <>
      <TableRow className="text-base">
        <TableCell className="pl-5 font-bold text-zinc-800">
          {index + 1}
        </TableCell>
        <TableCell className="m-0 px-2 font-bold text-zinc-800">
          {occurrence?.device.phone_model}
          <br />
          <span className="font-normal">{occurrence?.device.brand}</span>
        </TableCell>
        <TableCell className="m-0 hidden px-2 font-bold capitalize md:table-cell">
          {occurrence?.user.name}
        </TableCell>
        <TableCell className="m-0 hidden px-2 font-bold md:table-cell">
          {`${occurrence?.device.imei.slice(0, 1)} ${occurrence?.device.imei.slice(1, 8)} ****** **`}
        </TableCell>
        <TableCell className="w-24">
          <span
            className={cn(
              "flex w-24 items-center justify-center rounded-md capitalize",
              occurrence?.device.status === "Roubado" &&
                "bg-robbery-bg p-1 text-robbery-text",
              occurrence?.device.status === "Recuperado" &&
                "bg-recovered-bg p-1 text-recovered-text",
              occurrence?.device.status === "Regular" &&
                "bg-regular-bg p-1 text-regular-text",
              occurrence?.device.status === "Furtado" &&
                "bg-theft-bg p-1 text-theft-text",
              occurrence?.device.status === "Perdido" &&
                "bg-lost-bg p-1 text-lost-text",
            )}
          >
            {occurrence?.device.status.replace(" ", "")}
          </span>
        </TableCell>
        <TableCell className="flex h-20 items-center gap-2 py-28 pr-7 md:py-10">
          <div className="flex w-full flex-col items-center gap-2 md:flex-row">
            <OccurrenceDetails occurrence={occurrence} />
            {occurrence?.event ? (
              <RecoverDeviceForm
                occurrence={occurrence}
                setOccurrences={setOccurrences}
              />
            ) : (
              <button
                type="button"
                disabled
                className="group relative hidden h-10 w-10 items-center justify-center rounded-lg bg-zinc-300 ring-1 ring-zinc-300 hover:opacity-90 disabled:cursor-default md:flex"
              >
                <Image
                  alt="recuperar dispositivo"
                  src={recoveryIcon}
                  className="opacity-50"
                />
              </button>
            )}
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
