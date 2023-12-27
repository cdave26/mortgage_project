import { uplistApi } from "~/utils/api-handler";

/**
 * Initialize cookie from the server
 *
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getCookie = () => {
  return uplistApi.get("/sanctum/csrf-cookie");
};

/**
 * Login the user
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const login = (body, signal) => {
  return uplistApi.post("/api/login", body, { signal });
};

/**
 * Logout the user
 *
 * @returns {Promise<AxiosResponse<T>>}
 */
export const logout = () => {
  return uplistApi.post("/api/logout");
};

/**
 * Set new password for newly logged in users
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const setNewPassword = (body, signal) => {
  return uplistApi.post("/api/reset-password", body, { signal });
};

/**
 * Request OTP from server
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const requestOtp = (body, signal) => {
  return uplistApi.post("/api/request-otp", body, { signal });
};

/**
 * Verify OTP
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const verifyOtp = (body, signal) => {
  return uplistApi.post("/api/verify-otp", body, { signal });
};

/**
 * Handle success stripe checkout
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const sendVerificationEmail = (body, signal) => {
  return uplistApi.post("/api/send-verification-email", body, { signal });
};

/**
 * Handle success stripe checkout
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const verifyEmail = (body, signal) => {
  return uplistApi.post("/api/verify-email", body, { signal });
};

/**
 * Get user type
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getUserTypesAPI = (signal) =>
  uplistApi.get("/api/user-types", { signal });
