import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/auth/useAuth';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { Table } from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import { Toast } from '@/components/ui/Toast';
import { useChangeUserRole, useCreateUser, useToggleUserActive, useUsers } from '@/hooks/useUsers';
import { mapApiMessage } from '@/lib/apiMessages';
import { formatDateTime } from '@/lib/format';
import { DEFAULT_USER_VALUES, toCreateUserRequest, userFormSchema } from '@/lib/userForm';
import type { UserFormValues } from '@/lib/userForm';
import type { User } from '@/types/user';

function ActiveBadge({ active }: { active: boolean }) {
  return <Badge tone={active ? 'success' : 'danger'}>{active ? 'Activo' : 'Inactivo'}</Badge>;
}

export function UsersPage() {
  const { session } = useAuth();
  const users = useUsers();
  const createUser = useCreateUser();
  const toggleActive = useToggleUserActive();
  const changeRole = useChangeUserRole();

  const [showForm, setShowForm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<'success' | 'danger'>('success');
  const dismissToast = useCallback(() => setToastMessage(null), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT_USER_VALUES,
  });

  const mutating = toggleActive.isPending || changeRole.isPending;
  const currentEmail = session?.email;

  const notify = useCallback((tone: 'success' | 'danger', message: string) => {
    setToastTone(tone);
    setToastMessage(message);
  }, []);

  const handleToggleActive = useCallback(
    (user: User) => {
      toggleActive
        .mutateAsync({ id: user.id, active: !user.active })
        .then(() => notify('success', user.active ? 'Usuario desactivado.' : 'Usuario activado.'))
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [toggleActive, notify],
  );

  const handleChangeRole = useCallback(
    (user: User, role: UserFormValues['role']) => {
      if (role === user.role) return;
      changeRole
        .mutateAsync({ id: user.id, role })
        .then(() => notify('success', `Rol de ${user.email} actualizado.`))
        .catch((error) => notify('danger', mapApiMessage(error)));
    },
    [changeRole, notify],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (createUser.isPending) return;
    try {
      await createUser.mutateAsync(toCreateUserRequest(values));
      notify('success', 'Usuario creado correctamente.');
      reset(DEFAULT_USER_VALUES);
      setShowForm(false);
    } catch (error) {
      notify('danger', mapApiMessage(error));
    }
  });

  const columns: readonly TableColumn<User>[] = [
    {
      header: 'Email',
      cell: (user) => (
        <span>
          {user.email}
          {user.email === currentEmail && (
            <span className="ml-1.5 text-xs font-medium text-violet-700">(tú)</span>
          )}
        </span>
      ),
    },
    {
      header: 'Rol',
      cell: (user) => (
        <Select
          aria-label={`Rol de ${user.email}`}
          className="max-w-40"
          value={user.role}
          disabled={mutating}
          onChange={(event) => handleChangeRole(user, event.target.value as UserFormValues['role'])}
        >
          <option value="ADMIN">Administrador</option>
          <option value="OPERATOR">Operador</option>
        </Select>
      ),
    },
    {
      header: 'Estado',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <ActiveBadge active={user.active} />
          <Button
            variant="ghost"
            className="px-2 py-1 text-xs"
            disabled={mutating}
            onClick={() => handleToggleActive(user)}
            aria-label={user.active ? `Desactivar a ${user.email}` : `Activar a ${user.email}`}
          >
            {user.active ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      ),
    },
    { header: 'Creado', cell: (user) => formatDateTime(user.createdAt) },
  ];

  let content;
  if (users.isPending) {
    content = (
      <div className="mt-6 flex items-center justify-center gap-3 rounded-lg border border-border bg-surface py-16">
        <Spinner label="Cargando usuarios" />
        <p className="text-sm text-ink-muted">Cargando usuarios…</p>
      </div>
    );
  } else if (users.isError) {
    content = (
      <ErrorState message={mapApiMessage(users.error)} onRetry={() => void users.refetch()} />
    );
  } else if (users.data.length === 0) {
    content = (
      <EmptyState
        title="No hay usuarios"
        message="Cuando se cree el primer usuario aparecerá en esta tabla."
      />
    );
  } else {
    content = (
      <Table
        caption="Usuarios del sistema"
        columns={columns}
        rows={users.data}
        getRowKey={(user) => user.id}
      />
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Usuarios</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Crea cuentas y administra roles y estado. Solo administradores.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="min-w-36">
            + Nuevo usuario
          </Button>
        )}
      </div>

      <div className="mt-6">{content}</div>

      {showForm && (
        <form
          onSubmit={onSubmit}
          className="mt-6 max-w-2xl rounded-lg border border-border bg-surface p-6"
          noValidate
        >
          <h2 className="text-base font-semibold text-ink">Nuevo usuario</h2>
          <p className="mt-1 text-sm text-ink-muted">La cuenta se crea activa por defecto.</p>

          <fieldset disabled={createUser.isPending} className="mt-4 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="off"
              placeholder="nombre@empresa.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
                error={errors.password?.message}
              />
              <Select label="Rol" {...register('role')} error={errors.role?.message}>
                <option value="OPERATOR">Operador</option>
                <option value="ADMIN">Administrador</option>
              </Select>
            </div>
          </fieldset>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={createUser.isPending}
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={createUser.isPending} className="min-w-36">
              Guardar usuario
            </Button>
          </div>
        </form>
      )}

      <p className="mt-4 text-sm text-ink-muted">
        No puedes desactivarte ni cambiar tu propio rol, y el último administrador activo no se
        puede desactivar ni degradar.
      </p>

      {toastMessage && (
        <Toast tone={toastTone} onDismiss={dismissToast}>
          {toastMessage}
        </Toast>
      )}
    </section>
  );
}
