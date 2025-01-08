import DeviceSchema from "@/schemas/deviceSchema"
import { z } from "zod"

// @Glaymar
// Ajusta aqui as tipagens parao que tem no banco de dados
export interface DeviceProps {
  phone_number: string
  phone_model: string
  brand: string
  imei: string
  latitude: number
  longitude: number
}

export type Device = z.infer<typeof DeviceSchema>;