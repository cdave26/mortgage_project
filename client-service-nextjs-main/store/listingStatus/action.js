import { onHandleError } from "~/error/onHandleError";
import { getListingStatusesAPI } from "./api";
import { LISTING_STATUS } from "./type";

/**
 * Get Listing status list
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getListingStatusAction = () => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      listingStatus: {
        statuses: { data },
      },
    } = getState();

    try {
      dispatch({
        type: LISTING_STATUS.listingStatusList,
        payload: { data, loading: true },
      });

      // intercept if there is a data stored already
      if (data.length) {
        return dispatch({
          type: LISTING_STATUS.listingStatusList,
          payload: { data, loading: false },
        });
      }

      const response = await getListingStatusesAPI(signal);
      if (response.status === 200) {
        const mapped = response.data.listing_statuses.map((item) => {
          return {
            value: item.id,
            label:
              item.description === "Archived" ? "Archive" : item.description,
          };
        });

        dispatch({
          type: LISTING_STATUS.listingStatusList,
          payload: { data: mapped, loading: false },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};
