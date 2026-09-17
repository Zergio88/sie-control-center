import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { palletsApi } from '@/api/palletsApi';
import type { CreatePalletRequest, Pallet } from '@/types/pallet';

const PALLETS_KEY = ['pallets'] as const;

/** Server state for the pallet catalog (form selects). */
export function usePallets() {
  return useQuery<Pallet[]>({
    queryKey: PALLETS_KEY,
    queryFn: palletsApi.list,
  });
}

/** POST /api/pallets — refreshes the catalog list. */
export function useCreatePallet() {
  const queryClient = useQueryClient();
  return useMutation<Pallet, unknown, CreatePalletRequest>({
    mutationFn: palletsApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: PALLETS_KEY }),
  });
}

/**
 * DELETE /api/pallets/{id}. A deleted pallet nulls `palletCode` on its
 * devices, so the device list is refreshed too.
 */
export function useDeletePallet() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: palletsApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PALLETS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });
}
