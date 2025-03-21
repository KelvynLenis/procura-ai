import { cpfSchema } from '@/types/cpfSchema'
import { imeiSchema } from '@/types/imeiSchema'
import { phoneNumberSchema } from '@/types/phoneNumberSchema'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateCPF(cpf: string) {
  try {
    const validCPF = cpfSchema.parse(cpf.trim())
    // ;
    return true // CPF válido
  } catch (error) {
    console.error(
      'Erro na validação do CPF:',
      error.errors[0]?.message || error.message
    )
    return false // CPF inválido
  }
}

export function validateIMEI(imei: string) {
  try {
    const isValidIMEI = imeiSchema.parse(imei.trim())
    return true // IMEI válido
  } catch (error) {
    console.error(
      'Erro na validação do IMEI:',
      error.errors[0]?.message || error.message
    )
    return false // IMEI inválido
  }
}

export function validatePhoneNumber(phoneNumber: string) {
  try {
    const isValidPhoneNumber = phoneNumberSchema.parse(phoneNumber.trim())
    return true // Número de celular válido
  } catch (error) {
    console.error(
      'Erro na validação do número de celular:',
      error.errors[0]?.message || error.message
    )
    return false // Número de celular inválido
  }
}

export function formatDateTime(isoString: string) {
  const date = new Date(isoString)

  // Formatar para "10:30 - 28/01/2025"
  return format(date, 'HH:mm - dd/MM/yyyy')
}

export function validateCoordinates(coordinates: number[]) {
  if (coordinates.length !== 2) {
    return false
  }

  const [latitude, longitude] = coordinates

  return latitude !== 0 && longitude !== 0
}
