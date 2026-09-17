import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zonesApi } from '@/api/zonesApi';
import type { CreateZoneRequest, Zone } from '@/types/zone';

const ZONES_KEY = ['zones'] as const;

/** Server state for the zones catalog. */
export function useZones() {
  return useQuery<Zone[]>({
    queryKey: ZONES_KEY,
    queryFn: zonesApi.list,
  });
}

/** POST /api/zones — refreshes the list so the new zone appears with its id. */
export function useCreateZone() {
  const queryClient = useQueryClient();
  return useMutation<Zone, unknown, CreateZoneRequest>({
    mutationFn: zonesApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ZONES_KEY }),
  });
}

/**
 * DELETE /api/zones/{id}. A deleted zone nulls `zoneName` on its locations, so
 * the locations list is refreshed too.
 */
export function useDeleteZone() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: zonesApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ZONES_KEY });
      void queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}
