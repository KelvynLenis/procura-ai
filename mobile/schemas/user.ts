import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres'),

  cpf: z.string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d+$/, 'CPF deve conter apenas números'),

  email: z.string()
    .email('Email inválido')
    .min(5, 'Email muito curto')
    .max(100, 'Email muito longo'),

  confirmEmail: z.string()
    .email('Email inválido'),

  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(50, 'A senha deve ter no máximo 50 caracteres'),

  confirmPassword: z.string()
}).refine((data) => data.email === data.confirmEmail, {
  message: 'Os emails não coincidem',
  path: ['confirmEmail']
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

export type CreateUserFormData = z.infer<typeof createUserSchema>; 