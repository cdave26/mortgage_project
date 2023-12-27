import { uplistApi } from "~/utils/api-handler";

/**
 * Generate flyers
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const generateFlyersAPI = (body, signal) =>
  uplistApi.post(`/api/generate-flyers`, body, { signal });

/**
 * Generate flyers with dynamic colors
 *
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const generateFlyersWithColorsAPI = (source, body, signal) =>
  uplistApi.post(`/api/html-to-pdf?source=${source}`, body, { signal });

/**
 * Get latest generated flyer data
 * @param {number} listingFlyerId
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getListingGeneratedFlyerAPI = (listingFlyerId, signal) =>
  uplistApi.get(`/api/generated-flyer/${listingFlyerId}`, { signal });

/**
 * Fetch flyer images API
 *
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const fetchFlyerImagesAPI = (page, limit, type, signal) =>
  uplistApi.get(`/api/flyer-images/${page}/${limit}?type=${type}`, { signal });

/**
 * Get all generated flyers (for csv)
 * @param {object} flyers
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getGeneratedFlyersAPI = (
  { search, addressSearch, activeArchive, createdBy, companyId },
  signal
) =>
  uplistApi.get(`/api/generated-flyers/all`, {
    params: {
      search,
      addressSearch,
      createdBy,
      companyId,
      activeArchive,
    },
    signal,
  });

/**
 * Get all Flyers
 * @param {object} flyers
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const fetchAllFlyersAPI = (
  {
    page,
    limit,
    sortBy,
    search,
    addressSearch,
    activeArchive,
    created_by,
    companyId,
  },
  signal
) =>
  uplistApi.get(`/api/flyers/${activeArchive}/${page}/${limit}`, {
    params: {
      search,
      addressSearch,
      sortBy,
      created_by,
      companyId,
    },
    signal,
  });

/**
 * Delete Flyer
 * @param {number} id
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteFlyerAPI = (id, signal) =>
  uplistApi.delete(
    `/api/archive-flyer`,
    {
      data: {
        id,
      },
    },
    {
      signal,
    }
  );

/**
 * Download flyer API
 * @param {string} fileName
 * @param {object} flyersDownload
 * @param {function} setFlyersDownload
 * @param {AbortSignal} signal
 */
export const downloadFlyerAPI = (
  fileName,
  flyersDownload,
  setFlyersDownload,
  signal
) => {
  return uplistApi.get(
    `/api/download-flyer?file_name=${fileName}`,
    {
      headers: {
        "Content-Type": "application/pdf",
      },
      onDownloadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        setFlyersDownload({
          ...flyersDownload,
          open: true,
          progress,
        });
      },
      responseType: "blob",
    },
    { signal }
  );
};
