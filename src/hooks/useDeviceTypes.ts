import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deviceTypesApi } from '@/api/deviceTypesApi';
import type { CreateDeviceTypeRequest, DeviceType } from '@/types/deviceType';

const DEVICE_TYPES_KEY = ['deviceTypes'] as const;

/** Server state for the device-type catalog (form selects). */
export function useDeviceTypes() {
  return useQuery<DeviceType[]>({
    queryKey: DEVICE_TYPES_KEY,
    queryFn: deviceTypesApi.list,
  });
}

/** POST /api/device-types — refreshes the catalog list. */
export function useCreateDeviceType() {
  const queryClient = useQueryClient();
  return useMutation<DeviceType, unknown, CreateDeviceTypeRequest>({
    mutationFn: deviceTypesApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: DEVICE_TYPES_KEY }),
  });
}

/**
 * DELETE /api/device-types/{id}. A deleted type nulls `deviceTypeName` on its
 * devices and spare lots, so those lists are refreshed too.
 */
export function useDeleteDeviceType() {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, number>({
    mutationFn: deviceTypesApi.remove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DEVICE_TYPES_KEY });
      void queryClient.invalidateQueries({ queryKey: ['devices'] });
      void queryClient.invalidateQueries({ queryKey: ['spareLots'] });
    },
  });
}
