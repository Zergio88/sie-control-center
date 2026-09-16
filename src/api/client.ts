import { clearSession, getStoredToken } from '@/lib/tokenStorage';
import type { ApiError } from '@/types/auth';

/**
 * Dispatched whenever an authenticated request comes back 401/403 — the
 * backend's signal for "missing/expired/invalid token" (it returns 403 with
 * an empty body for unauthenticated access). The AuthProvider listens for it
 * and drops the session so guards redirect to /login.
 */
export const AUTH_LOST_EVENT = 'sie:auth-lost';

export const NETWORK_ERROR_MESSAGE =
  'No se pudo conectar con el servidor. Verifica tu conexión e inténtalo de nuevo.';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  /** Attach the stored Bearer token and treat 401/403 as session loss. Default true. */
  auth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = new URL(path, API_URL);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

function parseBody(text: string): unknown {
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function toApiError(status: number, data: { message?: string } | string | undefined): ApiError {
  if (typeof data === 'object' && data !== null && typeof data.message === 'string') {
    return { status, message: data.message };
  }
  if (typeof data === 'string') {
    return { status, message: data };
  }
  const fallback =
    status === 401
      ? 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.'
      : status === 403
        ? 'No tienes permiso para realizar esta acción.'
        : status === 404
          ? 'Recurso no encontrado.'
          : 'Algo salió mal. Inténtalo de nuevo.';
  return { status, message: fallback };
}

function notifyAuthLost(): void {
  clearSession();
  window.dispatchEvent(new CustomEvent(AUTH_LOST_EVENT));
}

/**
 * Minimal fetch wrapper: JSON in/out, Bearer auth, URL-safe params and
 * normalized {@link ApiError}s. Works standalone (reads the token from
 * localStorage) so it is safe to call outside React.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = true, signal } = options;

  const url = buildUrl(path, params);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw { status: 0, message: NETWORK_ERROR_MESSAGE } satisfies ApiError;
  }

  if (auth && (response.status === 401 || response.status === 403)) {
    notifyAuthLost();
  }

  const raw = await response.text();
  const data = parseBody(raw) as { message?: string } | string | undefined;

  if (!response.ok) {
    throw toApiError(response.status, data);
  }

  return data as T;
}
