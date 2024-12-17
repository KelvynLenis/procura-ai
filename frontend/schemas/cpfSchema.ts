import { z } from "zod";

export const cpfSchema = z.string()
  .regex(/^[0-9]{11}$/, { message: "O CPF deve conter exatamente 11 dígitos numéricos." });