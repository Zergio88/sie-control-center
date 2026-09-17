import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { spareLotsApi } from '@/api/spareLotsApi';
import type { CreateSpareLotRequest, SpareLot } from '@/types/spareLot';

const SPARE_LOTS_KEY = ['spareLots'] as const;

/** Server state for the spare-lots catalog. */
export function useSpareLots() {
  return useQuery<SpareLot[]>({
    queryKey: SPARE_LOTS_KEY,
    queryFn: spareLotsApi.list,
  });
}

/** POST /api/spare-lots — refreshes the list so the new lot appears. */
export function useCreateSpareLot() {
  const queryClient = useQueryClient();
  return useMutation<SpareLot, unknown, CreateSpareLotRequest>({
    mutationFn: spareLotsApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: SPARE_LOTS_KEY }),
  });
}

/** DELETE /api/spare-lots/{id} — refreshes the list. */
export function useDeleteSpareLot() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: spareLotsApi.remove,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: SPARE_LOTS_KEY }),
  });
}
