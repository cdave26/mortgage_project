import { uplistApi } from "~/utils/api-handler";

/**
 * Get county per state
 * @param {Number} stateId
 * @param {AbortSignal} signal
 */
export const getCountiesPerStateApi = (stateId, signal) => {
  return uplistApi.get(`/api/counties/${stateId}`, { signal });
};
