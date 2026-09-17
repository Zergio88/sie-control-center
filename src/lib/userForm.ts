import { z } from 'zod';
import type { CreateUserRequest } from '@/types/user';
import type { UserRole } from '@/types/auth';

/**
 * Client-side validation for the admin "create user" form. Limits mirror the
 * backend CreateUserRequest DTO: email valid, password ≥ 8 characters and
 * role ADMIN|OPERATOR.
 */
export const userFormSchema = z.object({
  email: z.string().trim().min(1, 'El email es obligatorio.').email('Ingresa un email válido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  role: z.enum(['ADMIN', 'OPERATOR'], { message: 'Selecciona un rol.' }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const DEFAULT_USER_VALUES: UserFormValues = {
  email: '',
  password: '',
  role: 'OPERATOR',
};

/** Converts validated form values into the backend request shape. */
export function toCreateUserRequest(values: UserFormValues): CreateUserRequest {
  return {
    email: values.email,
    password: values.password,
    role: values.role satisfies UserRole,
  };
}
