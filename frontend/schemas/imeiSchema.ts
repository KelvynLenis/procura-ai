import { z } from "zod";

export const imeiSchema = z.string()
  .regex(/^[0-9]{15}$/, { message: "O IMEI deve conter exatamente 15 dígitos numéricos." });