import { useQuery } from '@tanstack/react-query';
import { palletsApi } from '@/api/palletsApi';
import type { Pallet } from '@/types/pallet';

/** Server state for the pallet catalog (form selects). */
export function usePallets() {
  return useQuery<Pallet[]>({
    queryKey: ['pallets'],
    queryFn: palletsApi.list,
  });
}
