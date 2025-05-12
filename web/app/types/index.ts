export interface Device {
  $id: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
  $collectionId: string
  $databaseId: string
  auth_id: string
  brand: string
  imei: string
  is_stolen: boolean
  phone_model: string
  phone_number: string
  operator_id: string
  status: string
}

export interface Event {
  $id: string
  $createdAt: string
  $updatedAt: string
  $permissions: string[]
  $collectionId: string
  $databaseId: string
  type: string
  description: string
  time_event: string
  id_device: string
  last_location: [number, number]
  is_alert_on: boolean
}

export interface OccurrencesProps {
  device: Device
  event: Event
  user: {
    name: string
    email: string
    cpf?: string
  }
} 