import { uplistApi } from "~/utils/api-handler";

const prefix = "/api/licenses";

/**
 * Get License list
 * @param {Number} user_id
 * @param {Number} page
 * @param {Number} limit
 * @param {AbortSignal} signal
 * @param {Text} search
 * @param {Text} state
 * @param {Text} sortBy
 * @param {Text} order
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getUserLicenseListAPI = (
  user_id,
  page,
  limit,
  signal,
  search,
  state,
  sortBy,
  order
) =>
  uplistApi.get(
    `${prefix}/${user_id}/${page}/${limit}?search=${search}&state=${state}&sortBy=${sortBy}&order=${order}`,
    { signal }
  );

/**
 * Create License
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createUserLicenseAPI = (body, signal) =>
  uplistApi.post(`${prefix}`, body, { signal });

/**
 * Get license by id
 * @param {Number} id
 * @param {AbortSignal} signal
 */
export const getLicenseByIdAPI = (id, signal) =>
  uplistApi.get(`${prefix}/${id}`, { signal });

/**
 * Update License
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const updateLicenseAPI = (id, body, signal) =>
  uplistApi.put(`${prefix}/${id}`, body, { signal });

/**
 * Delete License
 * @param {Number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteLicenseAPI = (id, signal) =>
  uplistApi.delete(`${prefix}/${id}`, { signal });

/**
 * Get License per state per user
 * @param {Number} stateId
 * @param {Number} userId
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getLicensePerStateAPI = (stateId, userId, signal) =>
  uplistApi.get(`${prefix}/state/${stateId}/user/${userId}`, { signal });

/**
 * Get Licenses per user
 * @param {Number} userId
 * @param {String} selectedLabel
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getLicenseStatesPerUserAPI = (userId, selectedLabel, signal) =>
  uplistApi.get(`${prefix}/user/${userId}?orderBy=${selectedLabel}`, {
    signal,
  });
