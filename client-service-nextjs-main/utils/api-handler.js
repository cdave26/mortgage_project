import axios from "axios";

/**
 * Instance of axios
 */

export const uplistApi = axios.create({
  baseURL: process.env.REACT_APP_API_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});
