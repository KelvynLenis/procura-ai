import cepSearchResponseSchema from "@/schemas/cepSearchResponseSchema";
import DeviceSchema from "@/schemas/deviceSchema"
import districtSchema from "@/schemas/districtSchema";
import EventSchema from "@/schemas/eventSchema";
import { z } from "zod"

export interface DeviceProps {
  $id?: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Marca do telefone
  imei: string; // IMEI do telefone
  is_stolen?: boolean; // Status de "roubado" (true/false)
  auth_id?: string
  status?: string
}

export interface EventProps {
  device: Device;
  event: Event;
  user: {
    name: string;
    email: string;
  }
}

export type Device = z.infer<typeof DeviceSchema>;
export type Event = z.infer<typeof EventSchema>;
export type District = z.infer<typeof districtSchema>;
export type cepSearchResponse = z.infer<typeof cepSearchResponseSchema>;