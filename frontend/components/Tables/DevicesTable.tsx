'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DeviceRow } from "./DeviceRow"
import { useState } from "react"
import { DeviceProps } from "@/utils/types"

export function DevicesTable() {
  const [devices, setDevices] = useState<DeviceProps[]>([])

  return (
    <Table className="bg-white shadow-lg rounded-lg self-center">
      <TableHeader className="bg-zinc-200/60">
        <TableRow>
          <TableHead className="text-black/80">Modelo</TableHead>
          <TableHead className="text-black/80">Marca</TableHead>
          <TableHead className="text-black/80">IMEI</TableHead>
          <TableHead className="text-black/80">Status</TableHead>
          <TableHead className="w-fit"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <DeviceRow $id="ID" phone_number="Telefone" phone_model="Galaxy A54" brand="Samsung" imei="2 242974 222222 22" isStolen={false} setDevices={setDevices} />
        <DeviceRow $id="ID2" phone_number="Telefone" phone_model="Redmi Note 7" brand="Xiaomi" imei="2 242974 222222 22" isStolen setDevices={setDevices} />
        <DeviceRow $id="ID3" phone_number="Telefone" phone_model="Redmi Note 7" brand="Xiaomi" imei="2 242974 222222 22" isStolen={false} setDevices={setDevices} />
      </TableBody>
    </Table>
  )
}