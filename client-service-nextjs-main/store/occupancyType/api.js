import { uplistApi } from '~/utils/api-handler';

const prefix = '/api/occupancy-types';

/**
 * Get Occupancy Type list
 * @param {AbortSignal} params.signal
 * @returns @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getOccupancyTypesAPI = (signal) =>
  uplistApi.get(prefix, {
    signal,
  });
