import { z } from "zod"

const CreateDeviceSchema = z.object({
  $id: z.string().optional(),
  imei: z.string(),
  phone_model: z.string(),
  brand: z.string(),
  phone_number: z.string(),
  operator_id: z.string(),
})

export default CreateDeviceSchema