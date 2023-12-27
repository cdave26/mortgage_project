import { uplistApi } from "~/utils/api-handler";

/**
 * Get Number of units API
 * @param {AbortSignal} signal
 */
export const getNumberOfUnitsAPI = (signal) => {
  return uplistApi.get(`/api/units`, { signal });
};
