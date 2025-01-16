import DeviceSchema from "@/schemas/deviceSchema"
import { z } from "zod"

// @Glaymar
// Ajusta aqui as tipagens parao que tem no banco de dados
export interface DeviceProps {
  $id?: string; // ID do dispositivo
  phone_number: string; // Número de telefone
  phone_model: string; // Modelo do telefone
  brand: string; // Marca do telefone
  imei: string; // IMEI do telefone
  isStolen?: boolean; // Status de "roubado" (true/false)
}

export type Device = z.infer<typeof DeviceSchema>;