import { cpfSchema } from "@/schemas/cpfSchema";
import { imeiSchema } from "@/schemas/imeiSchema";
import { phoneNumberSchema } from "@/schemas/phoneNumberSchema";
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

export function validateIMEI(imei: string) {
  try {
    const isValidIMEI = imeiSchema.parse(imei.trim());
    return true; // IMEI válido
  } catch (error) {
    console.error("Erro na validação do IMEI:", error.errors[0]?.message || error.message);
    return false; // IMEI inválido
  }
};

export function validatePhoneNumber(phoneNumber: string) {
  try {
    const isValidPhoneNumber = phoneNumberSchema.parse(phoneNumber.trim());
    return true; // Número de celular válido
  } catch (error) {
    console.error("Erro na validação do número de celular:", error.errors[0]?.message || error.message);
    return false; // Número de celular inválido
  }
};
