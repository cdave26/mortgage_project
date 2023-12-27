import {
  onDispatchError,
  checkPath,
  onHandleError,
} from "~/error/onHandleError";
import { getListingGetPaymentsAPI, getPublicListingAPI } from "./api";
import { PUBLIC_STORE } from "./type";
import { getPropertyTypesAction } from "../propertyType/action";
import { getCreditScoreRangeAction } from "../creditScoreRange/action";
import { getOccupancyTypesAction } from "../occupancyType/action";
import { getNumberOfUnitsAction } from "../numberOfUnits/action";
import { checkUserDetailsAPI } from "../users/api";
import { getLicenseStatesPerUserAction } from "../licenses/action";
import { createListingAPI } from "../listing/api";

/**
 * Get listings
 * @param {Object} query
 * @returns {void}
 */
export const getPublicListingAction = ({ id, mlsNumber }) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      publicStore: { publicListing },
    } = getState();

    try {
      dispatch({
        type: PUBLIC_STORE.publicListing,
        payload: {
          loading: true,
          data:
            Object.keys(publicListing.data).length > 0
              ? publicListing.data
              : {},
        },
      });

      const response = await getPublicListingAPI(id, mlsNumber, signal);

      if (response.status === 200) {
        dispatch({
          type: PUBLIC_STORE.publicListing,
          payload: {
            loading: false,
            data: response.data.listing,
          },
        });
      }
    } catch (error) {
      onDispatchError(dispatch, "Error", error.response.data.message);
      checkPath(null);
    } finally {
      controller.abort();
    }
  };
};

export const listingGetPaymentsAction = async ({ listingId, body, signal }) => {
  return await getListingGetPaymentsAPI(listingId, body, signal);
};

/**
 * Check if the user is exists
 * @param {Object} payload
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const checkPubQuickQuoteAction = (payload, setFirstRender) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      dispatch({
        type: PUBLIC_STORE.publicQuickQuote,
        payload: {
          loading: true,
          data: {},
        },
      });

      const response = await checkUserDetailsAPI(payload, signal);

      // query after verifying user existence
      if (response.status === 200) {
        dispatch(getLicenseStatesPerUserAction(response.data.user.id));
        dispatch(getPropertyTypesAction(true));
        dispatch(getCreditScoreRangeAction(true));
        dispatch(getOccupancyTypesAction(true));
        dispatch(getNumberOfUnitsAction());

        dispatch({
          type: PUBLIC_STORE.publicQuickQuote,
          payload: {
            loading: false,
            data: response.data.user,
          },
        });

        setTimeout(() => {
          setFirstRender(false);
        }, 2500);
      }
    } catch (error) {
      controller.abort();
      onHandleError(error, dispatch);
    }
  };
};

/**
 * Check if the user (CA/LO) is existing for Agent Listing form
 * @param {Object} payload
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const checkPubListingAction = (payload, setFirstRender) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      dispatch({
        type: PUBLIC_STORE.publicAgentListing,
        payload: {
          loading: true,
          loanOfficerData: {},
        },
      });

      const response = await checkUserDetailsAPI(payload, signal);

      // query after verifying user existence
      if (response.status === 200) {
        const userData = response.data.user;
        dispatch(getLicenseStatesPerUserAction(userData.id));
        dispatch(getPropertyTypesAction(true));
        dispatch(getNumberOfUnitsAction());

        dispatch({
          type: PUBLIC_STORE.publicAgentListing,
          payload: {
            loading: false,
            loanOfficerData: userData,
          },
        });

        setTimeout(() => {
          setFirstRender(false);
        }, 2500);
      }
    } catch (error) {
      controller.abort();
      onHandleError(error, dispatch);
    }
  };
};

/**
 * Create listings publicly by agents action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createAgentListingAction = async (body, signal) => {
  return await createListingAPI(body, signal);
};

/**
 * Set public Quick quote states
 * @param {Object} payload
 */
export const setPubQuickQuoteStatesAction = (payload) => {
  return (dispatch) => {
    dispatch({
      type: PUBLIC_STORE.publicQuickQuoteStates,
      payload,
    });
  };
};

/**
 * Set listing agent states
 * @param {Object} payload
 */
export const setAgentListingStatesAction = (payload) => {
  return (dispatch) => {
    dispatch({
      type: PUBLIC_STORE.publicAgentListing,
      payload,
    });
  };
};
