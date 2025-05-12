import { z } from 'zod'

const PermissionsSchema = z.array(
  z.string().regex(/^(read|update|delete)\("user:.+"\)$/)
)

const DeviceSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string(),
  $permissions: PermissionsSchema,
  $updatedAt: z.string().datetime(),
  auth_id: z.string(),
  brand: z.string(),
  imei: z.string(),
  is_stolen: z.boolean(),
  phone_model: z.string(),
  phone_number: z.string(),
  status: z.string(),
  operator_id: z.string(),
})

export default DeviceSchema
