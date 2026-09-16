import { NETWORK_ERROR_MESSAGE } from '@/api/client';
import type { ApiError } from '@/types/auth';

/**
 * Known backend messages → Spanish. Backend errors are English; the UI is
 * Spanish, so well-known cases are translated here and everything else falls
 * back to a safe generic message.
 */
const EXACT_MESSAGES: Record<string, string> = {
  'Invalid email or password': 'Email o contraseña incorrectos.',
  'User account is disabled': 'Tu cuenta está deshabilitada. Contacta a un administrador.',
  'Email already registered': 'Ese email ya está registrado.',
};

export function mapApiMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) return NETWORK_ERROR_MESSAGE;

  const apiError = error as Partial<ApiError>;
  if (apiError.status === 0) return NETWORK_ERROR_MESSAGE;

  if (typeof apiError.message === 'string') {
    const translated = EXACT_MESSAGES[apiError.message];
    if (translated) return translated;
    return apiError.message;
  }

  switch (apiError.status) {
    case 401:
      return 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.';
    case 403:
      return 'No tienes permiso para realizar esta acción.';
    case 404:
      return 'Recurso no encontrado.';
    case 409:
      return 'El recurso ya existe.';
    default:
      return apiError.status !== undefined && apiError.status >= 500
        ? 'Error del servidor. Inténtalo de nuevo.'
        : NETWORK_ERROR_MESSAGE;
  }
}
