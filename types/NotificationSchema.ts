import { z } from "zod";

const NotificationSchema = z.object({
  $collectionId: z.string().optional(),
  $createdAt: z.string().datetime().optional(),
  $databaseId: z.string().optional(),
  $id: z.string().optional(),
  $permissions: z.array(z.string()).optional(),
  $updatedAt: z.string().datetime().optional(),
  sender_id: z.string().optional(),
  receiver_id: z.string().optional(),
  message: z.string(),
  is_read: z.boolean().optional(),
  type: z.string(),
  event_id: z.string().optional(),
  id_device: z.string().optional(),
  title: z.string().optional(),
  device_options: z.string().array().optional(),
  location_options: z.string().array().optional(),
  selected_targets: z.string().array().optional(),
  is_all_users_checked: z.boolean().optional(),
});

export default NotificationSchema;
