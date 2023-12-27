import { onHandleError } from "~/error/onHandleError";
import {
  getListingsApi,
  createListingAPI,
  getListingByIdAPI,
  updateListingAPI,
  deleteListingAPI,
  getListingActivityLogsAPI,
  sendLiveInHomeRatesInquiryAPI,
  getAllListingsApi,
} from "./api";
import { LISTINGS } from "./type";
import { getListingGeneratedFlyerAPI } from "../flyers/api";

import dayjs from "dayjs";
import config from "~/config";

const constructData = (listing) => {
  const { company_code, page_link, updated_at, id, partial_address } = listing;

  const constructed = {
    ...listing,
    address: partial_address,
    page_link: page_link
      ? `${config.appUrl}/${company_code}${page_link}/${id}`
      : "#",
    updated_at: dayjs(updated_at).format("MMM DD, YYYY"),
    formatted_updated_at: `${dayjs(updated_at).format(
      "MMMM DD, YYYY"
    )} at ${dayjs(updated_at).format("hh:mmA")}`,
  };

  return constructed;
};

/**
 * Get all listings (for CSV)
 * @param {Object} query
 * @returns {void}
 */
export const getAllListingsAction = async ({ search, signal }) => {
  const response = await getAllListingsApi(search, signal);

  return response.data.listings.map((item) => {
    return { ...constructData(item), key: item.id };
  });
};

/**
 * Get listings (paginated)
 * @param {Object} query
 * @returns {void}
 */
export const getListingsAction = ({ page, limit, search, sortBy, order }) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      listings: { listOfListings },
    } = getState();

    try {
      dispatch({
        type: LISTINGS.listOfListings,
        payload: {
          loading: true,
          list:
            Object.keys(listOfListings.list).length > 0
              ? listOfListings.list
              : {},
          page,
          limit,
          search,
          sortBy,
          order,
        },
      });

      const response = await getListingsApi(
        page,
        limit,
        signal,
        search,
        sortBy,
        order
      );

      if (response.status === 200) {
        const newData = {
          ...response.data.listings,
          data:
            response.data.listings.data.length > 0
              ? response.data.listings.data.map((item) => {
                  return { ...constructData(item), key: item.id };
                })
              : response.data.listings.data,
        };

        dispatch({
          type: LISTINGS.listOfListings,
          payload: {
            loading: false,
            list: newData,
            page: newData.current_page,
            limit: newData.per_page,
            search,
            sortBy,
            order,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: LISTINGS.listOfListings,
        payload: {
          loading: false,
          list: {},
          page: 1,
          limit: 10,
          search,
          sortBy,
          order,
        },
      });
    } finally {
      controller.abort();
    }
  };
};

/**
 * Create listings action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createListingAction = (body, signal) => {
  return async (dispatch) => {
    dispatch({
      type: LISTINGS.onProgress,
      payload: true,
    });

    return await createListingAPI(body, signal);
  };
};

/**
 * Is edit listing
 * @param {Boolean} isEdit
 * @returns {void}
 */
export const isEditListingAction = (isEdit) => {
  return (dispatch) => {
    dispatch({
      type: LISTINGS.isEdit,
      payload: isEdit,
    });
  };
};

/**
 * Listing that is selected
 * @param {Object} listing
 * @returns {void}
 */
export const selectedListingAction = (listing) => {
  return (dispatch) => {
    dispatch({
      type: LISTINGS.selectedListing,
      payload: listing,
    });
  };
};

/**
 * Get listing
 * @param {String} id
 * @returns {void}
 */
export const getListingAction = (id) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      dispatch({
        type: LISTINGS.onProgress,
        payload: true,
      });

      const response = await getListingByIdAPI(Number(id), signal);

      if (response.status === 200) {
        const constructed = constructData(response.data.listing);

        setTimeout(() => {
          dispatch(selectedListingAction(constructed));
        }, [300]);
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * Update listing details
 * @param {Object} listing
 * @returns {void}
 */
export const updateListingAction = (id, listing, signal) => {
  return async (dispatch, _) => {
    dispatch({
      type: LISTINGS.onProgress,
      payload: true,
    });

    return await updateListingAPI(Number(id), listing, signal);
  };
};

/**
 * Delete listing
 * @param {Object} id
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteListingAction = (id) => {
  return async (dispatch, _) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await deleteListingAPI(Number(id), signal);

      if (response.status === 200) {
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: response.data.message,
            description: "",
            position: "topRight",
            type: "success",
          },
        });

        dispatch({
          type: LISTINGS.deleteListing,
          payload: id,
        });

        return response;
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * ON SEARCH TYPING
 * @param {String} search
 * @returns {void}
 */
export const onSearchListingTypingAction = (search) => {
  return (dispatch) => {
    dispatch({
      type: LISTINGS.onSearchTyping,
      payload: search,
    });
  };
};

/**
 * Get listing's activity logs
 * @param {Object} query
 * @returns {void}
 */
export const getListingLogsAction = ({
  listingId,
  page,
  limit,
  sortBy,
  order,
}) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      listings: { listOfListingActivityLogs },
    } = getState();

    try {
      dispatch({
        type: LISTINGS.listOfListingActivityLogs,
        payload: {
          loading: true,
          list:
            Object.keys(listOfListingActivityLogs.list).length > 0
              ? listOfListingActivityLogs.list
              : {},
          page,
          limit,
          sortBy,
          order,
        },
      });

      const response = await getListingActivityLogsAPI(
        listingId,
        page,
        limit,
        signal,
        sortBy,
        order
      );

      if (response.status === 200) {
        const newData = {
          ...response.data.listingLogs,
          data:
            response.data.listingLogs.data.length > 0
              ? response.data.listingLogs.data.map((item) => {
                  return {
                    ...item,
                    key: item.id,
                    created_at: dayjs(item.created_at).format("MMM DD, YYYY"),
                    updated_by: `${item.user.first_name} ${item.user.last_name}`,
                  };
                })
              : response.data.listingLogs.data,
        };

        dispatch({
          type: LISTINGS.listOfListingActivityLogs,
          payload: {
            loading: false,
            list: newData,
            page: newData.current_page,
            limit: newData.per_page,
            sortBy,
            order,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: LISTINGS.listOfListingActivityLogs,
        payload: {
          loading: false,
          list: {},
          page: 1,
          limit: 10,
          sortBy,
          order,
        },
      });
    } finally {
      controller.abort();
    }
  };
};

/**
 * Get listing's latest generated flyer
 * @param {Object} query
 * @returns {void}
 */
export const getListingGeneratedFlyerAction = ({ listingId }) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      listings: { listingGeneratedFlyer },
    } = getState();

    try {
      dispatch({
        type: LISTINGS.listingGeneratedFlyer,
        payload: {
          loading: true,
          data: listingGeneratedFlyer.data,
        },
      });

      const response = await getListingGeneratedFlyerAPI(listingId, signal);

      if (response.status === 200) {
        const flyer = response.data.listingGeneratedFlyer;
        let formatted = [];
        if (flyer) {
          formatted = [
            {
              ...flyer,
              key: 0,
              updated_at: dayjs(flyer.updated_at).format("MMM DD, YYYY"),
              generated_by: `${flyer.first_name} ${flyer.last_name}`,
            },
          ];
        }

        dispatch({
          type: LISTINGS.listingGeneratedFlyer,
          payload: {
            loading: false,
            data: formatted,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: LISTINGS.listingGeneratedFlyer,
        payload: {
          loading: false,
          data: [],
        },
      });
    } finally {
      controller.abort();
    }
  };
};

/**
 * Send Live in home rates inquiry action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const sendLiveInHomeRatesInquiryAction = async (body, signal) => {
  return await sendLiveInHomeRatesInquiryAPI(body, signal);
};
