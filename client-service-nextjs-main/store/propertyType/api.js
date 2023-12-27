import { uplistApi } from '~/utils/api-handler';

const prefix = '/api/property-types';

/**
 * Get Property Type list
 * @param {AbortSignal} params.signal
 * @returns @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getPropertyTypesAPI = (signal) =>
  uplistApi.get(prefix, {
    signal,
  });
