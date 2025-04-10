import { cpfSchema } from '@/types/cpfSchema'
import { imeiSchema } from '@/types/imeiSchema'
import { phoneNumberSchema } from '@/types/phoneNumberSchema'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateCPF(cpf: string) {
  try {
    const validCPF = cpfSchema.parse(cpf.trim())
    return true // CPF válido
  } catch (error: any) {
    console.error(
      'Erro na validação do CPF:',
      error.errors[0]?.message || error.message
    )
    return false // CPF inválido
  }
}

/**
 * Valida se o IMEI tem exatamente 15 dígitos numéricos
 * @param imei - O número IMEI a ser validado
 * @returns boolean - true se o IMEI tiver 15 dígitos numéricos, false caso contrário
 */
export function validateImeiFormat(imei: string): boolean {
  return /^\d{15}$/.test(imei)
}

/**
 * Valida um número IMEI usando o Algoritmo de Luhn
 * @param imei - O número IMEI a ser validado
 * @returns boolean - true se o IMEI for válido, false caso contrário
 */
export function validateImeiWithLuhn(imei: string): boolean {
  // Converte o IMEI em um array de números
  const digits = imei.split('').map(Number)
  let sum = 0
  let isEven = false

  // Implementação do Algoritmo de Luhn
  // Itera do dígito mais à direita para a esquerda
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = digits[i]

    // Para posições pares (começando do final), dobra o dígito
    if (isEven) {
      digit *= 2
      // Se o resultado for maior que 9, subtrai 9
      if (digit > 9) {
        digit -= 9
      }
    }

    sum += digit
    isEven = !isEven
  }

  // O IMEI é válido se a soma for divisível por 10
  return sum % 10 === 0
}

export function validateIMEI(imei: string) {
  try {
    const trimmedImei = imei.trim()
    const isValidFormat = imeiSchema.parse(trimmedImei)
    return validateImeiWithLuhn(trimmedImei)
  } catch (error: any) {
    console.error(
      'Erro na validação do IMEI:',
      error.errors[0]?.message || error.message
    )
    return false
  }
}

export function validatePhoneNumber(phoneNumber: string) {
  try {
    const isValidPhoneNumber = phoneNumberSchema.parse(phoneNumber.trim())
    return true // Número de celular válido
  } catch (error: any) {
    console.error(
      'Erro na validação do número de celular:',
      error.errors[0]?.message || error.message
    )
    return false // Número de celular inválido
  }
}

export function formatDateTime(isoString: string) {
  try {
    return formatInTimeZone(
      new Date(isoString),
      'America/Sao_Paulo',
      'HH:mm - dd/MM/yyyy',
      { locale: ptBR }
    )
  } catch (error) {
    console.error('Erro ao formatar data:', error)
    return 'Data inválida'
  }
}

export function validateCoordinates(coordinates: number[]) {
  if (coordinates.length !== 2) {
    return false
  }

  const [latitude, longitude] = coordinates

  return latitude !== 0 && longitude !== 0
}

export function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
