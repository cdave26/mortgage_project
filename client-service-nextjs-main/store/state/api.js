import { uplistApi } from "~/utils/api-handler";

/**
 * Get states
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getStatesAPI = (signal) =>
  uplistApi.get("/api/states", { signal });

export const getStatesPerCompanyAPI = (companyId, label, signal) => {
  return uplistApi.get(
    `/api/company/${companyId}/states?orderBy=${label}`,
    signal
  );
};
