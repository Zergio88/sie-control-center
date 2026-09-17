import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { locationsApi } from '@/api/locationsApi';
import type { CreateLocationRequest, Location } from '@/types/location';

const LOCATIONS_KEY = ['locations'] as const;

/** Server state for the locations catalog. */
export function useLocations() {
  return useQuery<Location[]>({
    queryKey: LOCATIONS_KEY,
    queryFn: locationsApi.list,
  });
}

/** POST /api/locations — refreshes the list so the new location appears. */
export function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation<Location, unknown, CreateLocationRequest>({
    mutationFn: locationsApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY }),
  });
}

/**
 * DELETE /api/locations/{id}. A deleted location nulls `locationName` on its
 * pallets, so the pallets list is refreshed too.
 */
export function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: locationsApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LOCATIONS_KEY });
      void queryClient.invalidateQueries({ queryKey: ['pallets'] });
    },
  });
}
