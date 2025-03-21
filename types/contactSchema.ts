import { z } from 'zod'

const ContactSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string(),
  $permissions: z.array(z.string()),
  $updatedAt: z.string().datetime(),
  name_contact: z.string(),
  email_contact: z.string().optional(),
  number_contact: z.string(),
  user_id: z.string(),
})

export default ContactSchema
