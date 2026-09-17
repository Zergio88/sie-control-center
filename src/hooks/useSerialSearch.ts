import { useQuery } from '@tanstack/react-query';
import { devicesApi } from '@/api/devicesApi';
import { serialNumbersApi } from '@/api/serialNumbersApi';
import type { ApiError } from '@/types/auth';
import type { Device } from '@/types/device';
import type { SerialNumber } from '@/types/inventoryEntry';

/**
 * Retries transient failures once (cold starts, network blips) but never a
 * 404 — for this endpoint "not found" is the expected answer, not an error.
 */
function retryTransient(failureCount: number, error: unknown): boolean {
  const status =
    typeof error === 'object' && error !== null ? (error as Partial<ApiError>).status : undefined;
  if (status === 404) return false;
  return failureCount < 1;
}

/**
 * Server state for the serial search flow: first the exact serial lookup, then
 * (when found) the device it belongs to.
 */
export function useSerialSearch(value: string) {
  const serialQuery = useQuery<SerialNumber>({
    queryKey: ['serial-search', value],
    queryFn: () => serialNumbersApi.search(value),
    enabled: value !== '',
    retry: retryTransient,
  });

  const deviceId = serialQuery.data ? serialQuery.data.deviceId : null;
  const deviceQuery = useQuery<Device>({
    queryKey: ['device', deviceId],
    queryFn: () => devicesApi.getById(deviceId as number),
    enabled: deviceId !== null,
    retry: retryTransient,
  });

  return { serialQuery, deviceQuery };
}
