import { z } from 'zod'

const EventSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string(),
  $permissions: z.array(z.string()),
  $updatedAt: z.string().datetime(),
  description: z.string(),
  retrieval_location: z.string().optional(),
  address: z.string().optional(),
  id_device: z.string(),
  is_alert_on: z.boolean(),
  last_location: z.tuple([z.number(), z.number()]),
  time_event: z.string().datetime(),
  type: z.string(),
  id_district: z.string().optional(),
})

export default EventSchema
