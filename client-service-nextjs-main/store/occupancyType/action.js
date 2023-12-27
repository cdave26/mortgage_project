import { onHandleError } from "~/error/onHandleError";
import { getOccupancyTypesAPI } from "./api";
import { OCCUPANCYTYPE } from "./type";

/**
 * Get Occupancy Type list
 * @param {Boolean} mapped
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getOccupancyTypesAction = (mapped = false) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    try {
      const response = await getOccupancyTypesAPI(signal);
      if (response.status === 200) {
        const payload = response.data.occupancy_types.map((item) => {
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
          type: OCCUPANCYTYPE.occupancyTypeList,
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
