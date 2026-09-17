import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryEntriesApi } from '@/api/inventoryEntriesApi';
import type { InventoryEntryRequest, InventoryEntryResponse } from '@/types/inventoryEntry';

/**
 * POST /api/inventory-entries. A successful create adds a device, so the
 * device list and pallets are refreshed (pallet occupancy may change).
 */
export function useCreateInventoryEntry() {
  const queryClient = useQueryClient();

  return useMutation<InventoryEntryResponse, unknown, InventoryEntryRequest>({
    mutationFn: inventoryEntriesApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['devices'] });
      void queryClient.invalidateQueries({ queryKey: ['pallets'] });
    },
  });
}
