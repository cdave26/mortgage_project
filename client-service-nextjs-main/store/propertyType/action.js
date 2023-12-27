import { onHandleError } from "~/error/onHandleError";
import { getPropertyTypesAPI } from "./api";
import { PROPERTYTYPE } from "./type";

/**
 * Get Property Type list
 * @param {Boolean} mapped
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getPropertyTypesAction = (mapped = false) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    try {
      const response = await getPropertyTypesAPI(signal);

      if (response.status === 200) {
        const payload = response.data.property_types.map((item) => {
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
          type: PROPERTYTYPE.propertyTypeList,
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
