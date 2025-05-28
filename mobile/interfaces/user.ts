import { z } from 'zod';
import { validateCPF } from '@/lib/utils';
import { validateUserEmail } from '@/functions/user/validate-user-email';
import { validateUserCpf } from '@/functions/user/validate-user-cpf';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string()
    .min(11, 'O CPF deve conter exatamente 11 dígitos numéricos.')
    .refine((cpf) => validateCPF(cpf), {
      message: 'CPF inválido. Por favor, verifique os dígitos informados.',
    })
    .refine(
      async (cpf) => {
        try {
          return await validateUserCpf(cpf);
        } catch (error) {
          console.error('Erro ao verificar CPF:', error);
          return false;
        }
      },
      {
        message: 'Este CPF já está cadastrado no sistema.',
      }
    ),
  email: z.string()
    .email('Email inválido')
    .refine(
      async (email) => {
        try {
          return await validateUserEmail(email);
        } catch (error) {
          console.error('Erro ao verificar e-mail:', error);
          return false;
        }
      },
      {
        message: 'Este e-mail já está cadastrado no sistema.',
      }
    ),
  confirmEmail: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve conter pelo menos 8 caracteres.'),
  confirmPassword: z.string().min(8, 'A senha deve conter pelo menos 8 caracteres.'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'As senhas precisam ser iguais',
}).refine((data) => data.email === data.confirmEmail, {
  path: ['confirmEmail'],
  message: 'Os e-mails precisam ser iguais',
});

