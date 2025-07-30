import type { z } from 'zod'
import type cepSearchResponseSchema from './cepSearchResponseSchema'
import type DeviceSchema from './deviceSchema'
import type districtSchema from './districtSchema'
import type EventSchema from './eventSchema'
import type ContactSchema from './contactSchema'
import type { QueryFilterSchema } from './queryFilter'
import type { UserSchema } from './userSchema'
import type OperatorSchema from './operatorSchema'

export interface DeviceProps {
  $id?: string // ID do dispositivo
  phone_number: string // Número de telefone
  phone_model: string // Modelo do telefone
  brand: string // Fabricante do telefone
  imei: string // IMEI do telefone
  is_stolen?: boolean // Status de "roubado" (true/false)
  operator_id?: string
  auth_id?: string
  status?: string
}

export interface OccurrencesProps {
  device: Device
  event: Event
  user: {
    name: string
    email: string
    cpf: string
    emergency_contacts?: Array<{
      name: string
      email: string
    }>
  }
}

export interface Notification {
  $id: string
  type: string
  description: string
  time_event: string
  id_device: string
  is_alert_on: boolean
}

export type Device = z.infer<typeof DeviceSchema>
export type Event = z.infer<typeof EventSchema>
export type District = z.infer<typeof districtSchema>
export type cepSearchResponse = z.infer<typeof cepSearchResponseSchema>
export type Contact = z.infer<typeof ContactSchema>
export type QueryFilter = z.infer<typeof QueryFilterSchema>
export type User = z.infer<typeof UserSchema>
export type Operator = z.infer<typeof OperatorSchema>
