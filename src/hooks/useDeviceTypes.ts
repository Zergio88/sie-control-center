import { useQuery } from '@tanstack/react-query';
import { deviceTypesApi } from '@/api/deviceTypesApi';
import type { DeviceType } from '@/types/deviceType';

/** Server state for the device-type catalog (form selects). */
export function useDeviceTypes() {
  return useQuery<DeviceType[]>({
    queryKey: ['deviceTypes'],
    queryFn: deviceTypesApi.list,
  });
}
