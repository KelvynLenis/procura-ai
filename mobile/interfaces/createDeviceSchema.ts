import { z } from "zod"
import { validateIMEI } from "@/lib/utils"

const CreateDeviceSchema = z.object({
  $id: z.string().optional(),
  imei: z.string()
    .min(15, { message: 'O IMEI deve conter exatamente 15 dígitos numéricos.' })
    .max(15, { message: 'O IMEI deve conter exatamente 15 dígitos numéricos.' })
    .refine((imei) => validateIMEI(imei), {
      message: 'IMEI inválido. Por favor, verifique o número.'
    }),
  phone_model: z.string().min(1, { message: 'O modelo do dispositivo é obrigatório.' }),
  brand: z.string().min(1, { message: 'O fabricante do dispositivo é obrigatório.' }),
  phone_number: z.string()
    .min(11, { message: 'O número de celular deve conter exatamente 11 dígitos numéricos.' })
    .max(11, { message: 'O número de celular deve conter exatamente 11 dígitos numéricos.' }),
  operator_id: z.string().min(1, { message: 'A operadora é obrigatória.' }),
})

export default CreateDeviceSchema