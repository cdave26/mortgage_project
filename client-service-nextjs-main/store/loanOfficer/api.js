import { uplistApi } from '~/utils/api-handler';

const prefix = '/api/loan-officers';

/**
 * Get Loan Officer Information
 * @param {Object} buyerDetails
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getLoanOfficerAPI = (id, signal) => {
  return uplistApi.get(`${prefix}/${id}`, { signal });
};
