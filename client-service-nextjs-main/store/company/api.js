import { uplistApi } from "~/utils/api-handler";

const prefix = "/api/companies";
const companyDetails = "/api/get-company-by-code";

/**
 * Get company list by user id
 * @param {Number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getCompanyListAPI = (signal) =>
  uplistApi.get(`/api/company-per-user`, { signal });

/**
 * Get company list for csv
 * @param {String} name
 * @param {String} license
 * @param {String} state
 * @param {Number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getListOfCompaniesAPI = (
  name,
  company_nmls_number,
  state,
  signal
) =>
  uplistApi.get(`/api/company-list`, {
    params: {
      name,
      company_nmls_number,
      state,
    },
    signal,
  });

/**
 * Get company list
 * @param {String} name
 * @param {String} license
 * @param {String} state
 * @param {Number} page
 * @param {Number} limit
 * @param {string} sortBy
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const companyListAPI = (
  name,
  company_nmls_number,
  state,
  page,
  limit,
  sortBy,
  signal
) =>
  uplistApi.get(prefix, {
    params: {
      name,
      company_nmls_number,
      state,
      page,
      limit,
      sortBy,
    },
    signal,
  });

/**
 * Get company by id
 * @param {Number} companyId
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const getCompanyAPI = (companyId, signal) =>
  uplistApi.get(`${prefix}/${companyId}`, { signal });

/**
 * Delete company
 * @param {Number} companyId
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteCompanyAPI = (companyId, signal) =>
  uplistApi.delete(`${prefix}/${companyId}`, { signal });

/**
 * Create company formData API
 * @param {Object} data
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const createCompanyAPI = (data, signal) =>
  uplistApi.post(
    `${prefix}`,
    data,
    {
      headers: {
        "Content-Type": "application/multipart/form-data",
      },
    },
    {
      signal,
    }
  );

/**
 * Update company formData API
 * @param {Object} data
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const updateCompanyAPI = (companyId, data, signal) =>
  uplistApi.post(`${prefix}/${companyId}`, data, {
    signal,
    headers: {
      "Content-Type": "application/multipart/form-data",
    },
  });

/**
 * On check unique company name in company_nmls_number API
 * @param {Object} data
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const checkUniqueCompanyCompanyNMLSUmberAPI = (data, signal) =>
  uplistApi.post(`api/check-unique-company`, data, {
    signal,
  });

/**
 * Get hubspot company
 * @param {Number} limit
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getHubspotCompanyAPI = (limit, signal) =>
  uplistApi.get(`/api/get-hubspot-company-list/${limit} `, {
    signal,
  });

/**
 * Get Company Logo
 * @param {String} companyName
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getCompanyLogoAPI = (companyName, signal) =>
  uplistApi.get(`${companyDetails}/${companyName}`, {
    signal,
  });

/**
 * Search company by name
 * @param {String} name
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const searchCompanyAPI = (name, signal) =>
  uplistApi.get(
    `/api/serach-hubspot-company/`,
    {
      params: {
        query: name,
      },
    },
    {
      signal,
    }
  );

export const getCompanyByCodeAPI = (code, signal) =>
  uplistApi.get(`/api/get-company-by-code/${code}`, { signal });
