import { z } from 'zod'

const PermissionsSchema = z.array(
  z.string().regex(/^(read|update|delete)\("user:.+"\)$/)
)

export const UserSchema = z.object({
  $collectionId: z.string(), // ID da coleção
  $createdAt: z.string().datetime(), // Data de criação (ISO 8601)
  $databaseId: z.string(), // ID do banco de dados
  $id: z.string(), // ID único do documento
  $permissions: PermissionsSchema, // Lista de permissões no formato especificado
  $updatedAt: z.string().datetime(),
  user_id: z.string(),
  name: z.string(),
  email: z.string(),
  cpf: z.string(),
  type: z.string(),
  accessed_at: z.string().datetime(),
  status: z.string(),
})
