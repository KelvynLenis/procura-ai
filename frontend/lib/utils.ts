import { cpfSchema } from "@/schemas/cpfSchema";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateCPF(cpf: string) {
  try {
    const validCPF = cpfSchema.parse(cpf.trim());
    // console.log("CPF válido:", validCPF);
    return true; // CPF válido
  } catch (error) {
    console.error("Erro na validação do CPF:", error.errors[0]?.message || error.message);
    return false; // CPF inválido
  }
};
