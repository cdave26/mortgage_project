import { uplistApi } from '~/utils/api-handler';

const prefix = '/api/credit-score-ranges';

/**
 * Get Credit Score Range list
 * @param {AbortSignal} params.signal
 * @returns @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getCreditScoreRangeAPI = (signal) =>
  uplistApi.get(prefix, {
    signal,
  });
