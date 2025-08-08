import type { z } from 'zod'
import type DeviceSchema from './deviceSchema'
import { createUserSchema } from './user'
import CreateDeviceSchema from './createDeviceSchema'
import OperatorSchema from './operatorSchema'
import EventSchema from './eventSchema'
import districtSchema from './districtSchema'
import { UserSchema } from './userSchema'


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

export interface ImeiCheckResponse {
  status: string
  result: string
  imei: string
  count_free_checks_today: number
  readPerformance: string
  object: {
    brand: string
    name: string
    model: string
  }
}

export interface ImeiValidationResult {
  isValid: boolean
  brand?: string
  model?: string
  name?: string
  error?: string
}

export type Device = z.infer<typeof DeviceSchema>
export type CreateUserFormData = z.infer<typeof createUserSchema>
export type CreateDevice = z.infer<typeof CreateDeviceSchema>
export type Operator = z.infer<typeof OperatorSchema>
export type Event = z.infer<typeof EventSchema>
export type District = z.infer<typeof districtSchema>
export type User = z.infer<typeof UserSchema>