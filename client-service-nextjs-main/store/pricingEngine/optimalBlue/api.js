import { uplistApi } from "~/utils/api-handler";

const prefix = "/api/optimal-blue";

/**
 * Get OB's latest Strategy per company ID
 * @param {Number} companyId
 * @param {AbortSignal} signal
 */
export const getLatestStrategiesAPI = (companyId, signal) =>
  uplistApi.get(`${prefix}/get-latest-company-strategies/${companyId}`, {
    signal,
  });

/**
 * Get OB's saved Strategy per company ID
 * @param {AbortSignal} signal
 */
export const getCompanyStrategyAPI = (signal, companyId) =>
  uplistApi.get(`${prefix}/company-strategy?companyId=${companyId}`, {
    signal,
  });

/**
 * Get company's users strategy
 * @param {Number} page
 * @param {Number} limit
 * @param {String} search
 * @param {String} searchUserType
 * @param {String} sortBy
 * @param {String} order
 * @param {AbortSignal} signal
 */
export const getUsersStrategyAPI = (
  page,
  limit,
  search,
  searchUserType,
  sortBy,
  order,
  signal,
  companyId
) =>
  uplistApi.get(
    `${prefix}/users-strategy/${page}/${limit}?search=${search}&searchUserType=${searchUserType}&sortBy=${sortBy}&order=${order}&companyId=${companyId}`,
    { signal }
  );

/**
 * Get a user strategy
 * @param {Number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getUserStrategyByIdAPI = (id, signal) =>
  uplistApi.get(`${prefix}/users-strategy/${id}`, { signal });

/**
 * Create or Update a user strategy
 * @param {Number} id
 * @param {String} type
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const upsertUserStrategyAPI = (id, type = "", body, signal) =>
  uplistApi.put(`${prefix}/users-strategy/${id}?type=${type}`, body, {
    signal,
  });

/**
 * Mass Create or Update a user strategy
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const massUpsertUserStrategyAPI = (body, signal) =>
  uplistApi.put(`${prefix}/mass-update-strategy`, body, { signal });

/**
 * Get a company's default strategy
 * @param {AbortSignal} signal
 */
export const getDefaultStrategyAPI = (signal, companyId) =>
  uplistApi.get(`${prefix}/default-strategy?companyId=${companyId}`, {
    signal,
  });

/**
 * Create or Update a company's default strategy
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const upsertDefaultStrategyAPI = (body, signal) =>
  uplistApi.put(`${prefix}/default-strategy`, body, { signal });
