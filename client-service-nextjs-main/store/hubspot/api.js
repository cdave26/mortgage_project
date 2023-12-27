import { uplistApi } from "~/utils/api-handler";

/**
 * Get contact from HubSpot
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getHubspotContact = (body, signal) => {
  return uplistApi.post("/api/get-hubspot-contact", body, { signal });
};

/**
 * Get company from HubSpot
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getHubspotCompany = (body, signal) => {
  return uplistApi.post("/api/get-hubspot-company", body, { signal });
};
