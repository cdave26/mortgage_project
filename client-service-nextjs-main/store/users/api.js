import { uplistApi } from "~/utils/api-handler";

/**
 * Get all users (for CSV)
 * @param {String} search
 * @param {Number} companyId
 * @param {Number} priceEngineId
 * @param {String} userType
 * @param {String} filteredBy
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getAllUsersAPI = (
  search,
  companyId,
  priceEngineId,
  userType,
  filteredBy,
  signal
) =>
  uplistApi.get(
    `/api/users/all?search=${search}&company_id=${companyId}&pricing_engine_id=${priceEngineId}&userType=${userType}&filteredBy=${filteredBy}`,
    { signal }
  );

/**
 * Get user list (paginated)
 * @param {Number} id
 * @param {Number} company_id
 * @param {Number} page
 * @param {Number} limit
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const getUserListAPI = (
  id,
  company_id,
  page,
  limit,
  signal,
  search,
  companyId,
  priceEngineId,
  userType,
  sortBy,
  filteredBy
) =>
  uplistApi.get(
    `/api/users/${id}/${company_id}/${page}/${limit}?search=${search}&company_id=${companyId}&pricing_engine_id=${priceEngineId}&userType=${userType}&sortBy=${sortBy}&filteredBy=${filteredBy} `,
    {
      signal,
    }
  );

/**
 * Check if the email is already exist
 * @param {String} email
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const checkEmailIsExistAPI = (email, signal) =>
  uplistApi.post(
    `/api/check-email`,
    {
      email,
    },
    {
      signal,
    }
  );

/**
 * Create User
 * @param {Object} user
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const createUserAPI = (user, signal) =>
  uplistApi.post(
    `/api/register`,
    user,
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
 * Get User by id
 * @param {Number} company_id
 * @param {Number} id
 * @param {AbortSignal} signal
 */
export const getUserByIdAPI = (company_id, id, signal) =>
  uplistApi.get(`/api/user/${company_id}/${id}`, {
    signal,
  });

/**
 * Update User
 * @param {Object} user
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const updateUserAPI = (user, signal) =>
  uplistApi.post(
    `/api/update-user`,
    user,
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
 * Delete User
 * @param {Number} id
 * @param {Number} company_id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const deleteUserAPI = (id, company_id, signal) =>
  uplistApi.delete(
    `/api/delete-user`,
    {
      data: {
        id,
        company_id,
      },
    },
    {
      signal,
    }
  );

/**
 * get users per company
 * @param {Number} company_id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const getUsersPerCompanyAPI = (companyId, signal) =>
  uplistApi.get(`/api/users/company/${companyId}`, { signal });

/**
 *  Complete onboarding
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 * */

export const completeOnboardingAPI = (signal) =>
  uplistApi.post(`/api/complete-on-boarding`, {}, { signal });

/**
 *  Check user if either exists or active/active trial
 * @param {Object} payload
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 * */
export const checkUserAPI = (payload, signal) =>
  uplistApi.get(`/api/check-user`, { params: payload, signal });

/**
 *  Check user if either exists or not
 * @param {Object} payload
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 * */
export const checkUserDetailsAPI = (payload, signal) =>
uplistApi.get(`/api/get-user-details`, { params: payload, signal });

/**
 *  Get all user's name API
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 * */
export const getFullUserListAPI = (companyId, signal) =>
  uplistApi.get(`/api/full-user-list?companyId=${companyId}`, { signal });
