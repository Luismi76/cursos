import { z } from 'zod';

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'El email es requerido')
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    nombre: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre es demasiado largo'),
    email: z
        .string()
        .min(1, 'El email es requerido')
        .email('Email inválido'),
    password: z
        .string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres')
        .max(100, 'La contraseña es demasiado larga'),
    confirmPassword: z
        .string()
        .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
