import { z } from "zod";

export const phoneNumberSchema = z
  .string()
  .regex(/^[0-9]{11}$/, {
    message: "O número de celular deve conter exatamente 11 dígitos numéricos.",
  });
