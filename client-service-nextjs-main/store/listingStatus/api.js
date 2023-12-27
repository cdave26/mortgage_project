import { uplistApi } from "~/utils/api-handler";

const prefix = "/api/listing-statuses";

/**
 * Get Property Type list
 * @param {AbortSignal} params.signal
 * @returns @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getListingStatusesAPI = (signal) =>
  uplistApi.get(prefix, { signal });
