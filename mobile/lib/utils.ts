export function validateCPF(cpf: string): boolean {
  try {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) {
      return false;
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) {
      return false;
    }

    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(9))) {
      return false;
    }

    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleanCPF.charAt(10))) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro na validação do CPF:', error);
    return false;
  }
} 

export function formatISODateString(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year} - ${date.getHours()}:${date.getMinutes()}`;
}

export function validateImeiFormat(imei: string): boolean {
  return /^\d{15}$/.test(imei)
}

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
    return validateImeiFormat(trimmedImei) && validateImeiWithLuhn(trimmedImei)
  } catch (error: any) {
    console.error(
      'Erro na validação do IMEI:',
      error.errors?.[0]?.message || error.message
    )
    return false
  }
}