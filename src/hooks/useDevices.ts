import { useQuery } from '@tanstack/react-query';
import { devicesApi } from '@/api/devicesApi';
import type { Device } from '@/types/device';

/** Server state for the device list; invalidated after inventory entries. */
export function useDevices() {
  return useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: devicesApi.list,
  });
}
