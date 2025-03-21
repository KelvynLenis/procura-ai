import type { z } from 'zod'
import type cepSearchResponseSchema from './cepSearchResponseSchema'
import type DeviceSchema from './deviceSchema'
import type districtSchema from './districtSchema'
import type EventSchema from './eventSchema'
import type ContactSchema from './contactSchema'

export interface DeviceProps {
  $id?: string // ID do dispositivo
  phone_number: string // Número de telefone
  phone_model: string // Modelo do telefone
  brand: string // Marca do telefone
  imei: string // IMEI do telefone
  is_stolen?: boolean // Status de "roubado" (true/false)
  auth_id?: string
  status?: string
}

export interface EventProps {
  device: Device
  event: Event
  user: {
    name: string
    email: string
  }
}

export type Device = z.infer<typeof DeviceSchema>
export type Event = z.infer<typeof EventSchema>
export type District = z.infer<typeof districtSchema>
export type cepSearchResponse = z.infer<typeof cepSearchResponseSchema>
export type Contact = z.infer<typeof ContactSchema>
