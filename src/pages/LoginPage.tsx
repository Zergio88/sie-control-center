import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mapApiMessage } from '@/lib/apiMessages';

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/devices" replace />;
  }

  const from = (location.state as LoginLocationState | null)?.from ?? '/devices';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(mapApiMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-violet-950 px-4">
      <div className="w-full max-w-md -translate-y-2">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">SIE</h1>
          <p className="mt-2 text-lg text-violet-100/80">Sistema Integral de Inventario</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-5 text-xl font-medium text-ink">Iniciar sesión</h2>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger"
            >
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              autoFocus
              required
            />
            <Input
              label="Contraseña"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              required
            />
            <Button type="submit" className="btn-block" loading={submitting}>
              Ingresar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
