import { uplistApi } from '~/utils/api-handler';

/**
 * Get pricing engine
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getPricingEngineAPI = (signal) =>
    uplistApi.get('/api/pricing-engines', { signal });
