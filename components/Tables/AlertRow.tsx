'use client'

import { TableCell, TableRow } from '../ui/table'
import type { OccurrencesProps } from '@/types'
import { cn } from '@/lib/utils'
import { RecoverDeviceForm } from '../Forms/RecoverDeviceForm'
import recoveryIcon from '../../assets/icons/recover.png'
import { OccurrenceDetails } from '../OccurrenceDetails'
import Image from 'next/image'
import { useState } from 'react'

interface AlertRowProps {
  index: number
  occurrence?: OccurrencesProps
  setOccurrences: React.Dispatch<React.SetStateAction<OccurrencesProps[]>>
}

export function AlertRow({ index, occurrence, setOccurrences }: AlertRowProps) {
  return (
    <>
      <TableRow className="text-base">
        <TableCell className="font-bold text-zinc-800 pl-5">
          {index + 1}
        </TableCell>
        <TableCell className="font-bold text-zinc-800 px-2 m-0">
          {occurrence?.device.phone_model}
          <br />
          <span className="font-normal">{occurrence?.device.brand}</span>
        </TableCell>
        <TableCell className="font-bold capitalize hidden md:table-cell px-2 m-0">
          {occurrence?.user.name}
        </TableCell>
        <TableCell className="font-bold hidden md:table-cell px-2 m-0">
          {`${occurrence?.device.imei.slice(0, 1)} ${occurrence?.device.imei.slice(1, 8)} ****** **`}
        </TableCell>
        <TableCell className="w-24">
          <span
            className={cn(
              'rounded-md w-24 flex items-center justify-center capitalize',
              occurrence?.device.status === 'Roubado' &&
                'bg-robbery-bg text-robbery-text p-1',
              occurrence?.device.status === 'Recuperado' &&
                'bg-regular-bg text-regular-text p-1',
              occurrence?.device.status === 'Regular' &&
                'bg-regular-bg text-regular-text p-1',
              occurrence?.device.status === 'Furtado' &&
                'bg-theft-bg text-theft-text p-1',
              occurrence?.device.status === 'Perdido' &&
                'bg-lost-bg text-lost-text p-1'
            )}
          >
            {occurrence?.device.status.replace(' ', '')}
          </span>
        </TableCell>
        <TableCell className="flex gap-2 items-center h-20 py-28 md:py-10 pr-7">
          <div className="flex flex-col md:flex-row items-center w-full gap-2">
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
                className="hidden disabled:cursor-default md:flex rounded-lg w-10 h-10 ring-1 ring-zinc-300 group relative bg-zinc-300 items-center justify-center hover:opacity-90"
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
  )
}
