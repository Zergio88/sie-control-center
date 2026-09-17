import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/usersApi';
import type { CreateUserRequest, User } from '@/types/user';

/** Server state for the admin user list. */
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });
}

const USER_KEY = ['users'] as const;

/**
 * POST /api/users. On success the list is refreshed so the new account
 * appears with its server-generated id and timestamps.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation<User, unknown, CreateUserRequest>({
    mutationFn: usersApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: USER_KEY }),
  });
}

/**
 * PATCH /api/users/{id}/active. Optimistically updates the row for instant
 * feedback; a failure rolls back and surfaces the backend message (e.g. the
 * last active admin or the caller's own account).
 */
export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) => usersApi.setActive(id, active),
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: USER_KEY });
      const previous = queryClient.getQueryData<User[]>(USER_KEY);
      queryClient.setQueryData<User[]>(USER_KEY, (users) =>
        users?.map((user) => (user.id === id ? { ...user, active } : user)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData<User[]>(USER_KEY, context?.previous);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: USER_KEY }),
  });
}

/**
 * PATCH /api/users/{id}/role. Same optimistic pattern as
 * {@link useToggleUserActive}; the caller owns the confirmation flow.
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: CreateUserRequest['role'] }) =>
      usersApi.setRole(id, role),
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: USER_KEY });
      const previous = queryClient.getQueryData<User[]>(USER_KEY);
      queryClient.setQueryData<User[]>(USER_KEY, (users) =>
        users?.map((user) => (user.id === id ? { ...user, role } : user)),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData<User[]>(USER_KEY, context?.previous);
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: USER_KEY }),
  });
}
