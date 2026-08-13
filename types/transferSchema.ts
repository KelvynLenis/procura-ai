import { z } from "zod";

const TransferSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string(),
  $permissions: z.array(z.string()),
  $updatedAt: z.string().datetime(),
  used: z.boolean(),
  owner_id: z.string(),
  requester_id: z.string(),
  device_imei: z.string(),
  token_hash: z.string(),
});

export default TransferSchema;
