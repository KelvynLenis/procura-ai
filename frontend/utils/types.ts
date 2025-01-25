import DeviceSchema from "@/schemas/deviceSchema"
import { z } from "zod"

export interface DeviceProps {
  $id: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Marca do telefone
  imei: string; // IMEI do telefone
  isStolen?: boolean; // Status de "roubado" (true/false)
  auth_id?: string
}

export interface EventProps {
  id: string
  lastLocation: [number, number]
  type: string
  description: string
  datetime: string
  is_alert_on: boolean
  id_device?: string
}

export type Device = z.infer<typeof DeviceSchema>;