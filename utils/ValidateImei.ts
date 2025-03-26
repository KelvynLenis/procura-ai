/**
 * Valida um número IMEI usando o Algoritmo de Luhn
 * @param imei - O número IMEI a ser validado
 * @returns boolean - true se o IMEI for válido, false caso contrário
 */
export function validateImeiWithLuhn(imei: string): boolean {
  // Verifica se o IMEI tem exatamente 15 dígitos numéricos
  if (!/^\d{15}$/.test(imei)) {
    return false
  }

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

// Exemplo de uso:
// const imei = "123456789012345"
// const isValid = validateImeiWithLuhn(imei) 