import { onHandleError } from "~/error/onHandleError";
import { getCreditScoreRangeAPI } from "./api";
import { CREDITSCORERANGE } from "./type";

/**
 * Get Credit Score Range list
 * @param {Boolean} mapped
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getCreditScoreRangeAction = (mapped = false) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    try {
      const response = await getCreditScoreRangeAPI(signal);
      if (response.status === 200) {
        const payload = response.data.credit_score_ranges.map((item) => {
          // return object values depending on the use case
          return mapped
            ? {
                label: item.description,
                value: item.id,
              }
            : {
                id: item.id,
                value: item.description,
              };
        });

        dispatch({
          type: CREDITSCORERANGE.creditScoreRangeList,
          payload,
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};
