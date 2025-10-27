import { z } from "zod";

const PermissionsSchema = z.array(
  z.string().regex(/^(read|update|delete)\("user:.+"\)$/),
);

export const UserSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string(),
  $permissions: PermissionsSchema,
  $updatedAt: z.string().datetime(),
  user_id: z.string(),
  name: z.string(),
  email: z.string(),
  cpf: z.string(),
  type: z.string(),
  accessed_at: z.string().datetime(),
  status: z.string(),
  img_url: z.string().url(),
  push_token: z.string().optional(),
});
