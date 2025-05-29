import { z } from 'zod'


const OperatorSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string(),
  $permissions: z.array(z.string()),
  $updatedAt: z.string().datetime(),
  name_operator: z.string(),
  cnpj_operator: z.string().optional(),
  reason_operator: z.string(),
  head_operator: z.string().optional(),
  cod_operator: z.string().optional()
})

export default OperatorSchema
