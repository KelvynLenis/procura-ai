import DeviceSchema from "@/schemas/deviceSchema"
import { z } from "zod"

export interface DeviceProps {
  phone_number: string
  phone_model: string
  brand: string
  imei: string
  latitude: number
  longitude: number
}

export type Device = z.infer<typeof DeviceSchema>;