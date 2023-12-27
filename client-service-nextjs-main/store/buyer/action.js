import { getCookie, login } from "../auth/api";
import {
  createBuyerAPI,
  deleteBuyerAPI,
  getBuyerAPI,
  getBuyerPageAPI,
  getBuyersListAPI,
  registerBuyerAPI,
  syncBuyerOBAPI,
  updateBuyerAPI,
} from "./api";
import { BUYER } from "./type";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import * as jose from "jose";

/**
 * Set Loading
 * @param {Boolean} payload
 */
export const setInProgressAction = (dispatch, payload) => {
  dispatch({
    type: BUYER.inProgress,
    payload: payload,
  });
};

export const initializeBuyerDetails = (dispatch) => {
  dispatch({
    type: BUYER.buyerDetails,
    payload: {
      isLoading: false,
      buyerDetails: {},
    },
  });
};

/**
 * Snackbar
 * @param {Object} data
 */
const setSnackBarAction = (response, type, dispatch) => {
  dispatch({
    type: "UI/snackbars",
    payload: {
      open: true,
      message: response.data.message,
      description: "",
      position: "topRight",
      type,
    },
  });
};

/**
 * Create buyer action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createBuyerAction = async (body, user, dispatch) => {
  const controller = new AbortController();
  const { signal } = controller;

  if (user) {
    setInProgressAction(dispatch, true);
    try {
      const response = await createBuyerAPI(
        {
          ...body,
          company_id: user.company_id,
        },
        signal
      );
      if (response.status === 200) {
        return response;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      onHandleError(err, dispatch);
    } finally {
      setInProgressAction(dispatch, false);
    }
  } else {
    setInProgressAction(dispatch, false);
    throw new Error("Auth user not found");
  }
};

/**
 * Update buyer action
 * @param {Number} buyerID
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const updateBuyerAction = async (
  buyerId,
  body,
  user,
  dispatch,
  controller
) => {
  const { signal } = controller;
  if (user) {
    setInProgressAction(dispatch, true);
    try {
      const response = await updateBuyerAPI(
        {
          ...body,
          buyer_id: buyerId,
          user_id: user.id,
          company_id: user.company_id,
        },
        signal
      );

      if (response.status === 200) {
        return response;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      const defaultMobileError =
        "The borrower mobile number field must be 14 characters.";
      const invalidMobile = "Mobile number field must be 14 characters.";
      const errorMessage = err.response.data.message;

      if (errorMessage === defaultMobileError)
        err.response.data.message = invalidMobile;

      onHandleError(err, dispatch);
    } finally {
      setInProgressAction(dispatch, false);
    }
  } else {
    setInProgressAction(dispatch, false);
    throw new Error("Auth user not found");
  }
};

/**
 * Delete buyer action
 * @param {Number} buyerID
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteBuyerAction = async (buyerId, user, buyer, dispatch) => {
  const body = { user_id: user.id, company_id: user.company_id };
  const controller = new AbortController();
  const { signal } = controller;
  const userFullName = `${buyer.borrower_first_name} ${buyer.borrower_last_name}`;

  if (user) {
    try {
      const response = await deleteBuyerAPI(buyerId, body, signal);
      if (response.status === 200) {
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: `${userFullName} has been deleted.`,
            description: "",
            position: "topRight",
            type: "success",
          },
        });

        dispatch({
          type: BUYER.deleteBuyer,
          payload: {
            id: buyerId,
          },
        });

        return true;
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      onHandleError(err, dispatch);
    }
  } else {
    throw new Error("Auth user not found");
  }
};

/**
 * Get buyers list
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getBuyersListAction = () => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    setInProgressAction(dispatch, true);

    try {
      const response = await getBuyersListAPI(signal);
      if (response.status === 200) {
        dispatch({
          type: BUYER.buyerList,
          payload: {
            isLoading: false,
            buyers: response.data.buyers.data,
            page: response.data.buyers.from,
            pageLimit: response.data.buyers.per_page,
            total: response.data.buyers.total,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      setInProgressAction(dispatch, false);
      controller.abort();
    }
  };
};

/**
 * Get succedding buyers list
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getBuyerFromPageAction = (buyerPageInfo) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    setInProgressAction(dispatch, true);

    try {
      const response = await getBuyerPageAPI(buyerPageInfo, signal);
      if (response.status === 200) {
        const modifiedResponse = response.data.buyers.data.map((buyer) => {
          return {
            ...buyer,
            realEstateAgent: `${buyer.agent_first_name} ${buyer.agent_last_name}`,
          };
        });

        dispatch({
          type: BUYER.buyerList,
          payload: {
            isLoading: false,
            buyers: modifiedResponse,
            page: response.data.buyers.current_page,
            pageLimit: response.data.buyers.per_page,
            total: response.data.buyers.total,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      setInProgressAction(dispatch, false);
      controller.abort();
    }
  };
};

/**
 * Get buyers list
 * @param {Number} buyerId
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getBuyerAction = (buyerId) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    setInProgressAction(dispatch, true);
    try {
      const response = await getBuyerAPI(buyerId, signal);
      if (response.status === 200) {
        dispatch({
          type: BUYER.buyerDetails,
          payload: {
            isLoading: false,
            buyerDetails: response.data.buyer,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      setInProgressAction(dispatch, false);
      controller.abort();
    }
  };
};

export const registerBuyerAction = async (body, dispatch) => {
  const controller = new AbortController();
  const { signal } = controller;

  setInProgressAction(dispatch, true);

  try {
    await getCookie();
    const response = await registerBuyerAPI(body, signal);
    if (response.status === 200) {
      setSnackBarAction(response, "success", dispatch);
      try {
        const loginResponse = await login(
          {
            email: body.username,
            password: body.password,
            ip: body.ip,
            company: body.company,
          },
          signal
        );
        if (loginResponse.data.success) {
          const secret = new TextEncoder().encode(config.securityApp);
          const token = await new jose.SignJWT({
            userData: loginResponse.data.user,
          })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .sign(secret);

          window.localStorage.setItem("user", token);
          return response;
        }
      } catch (err) {
        onHandleError(err, dispatch);
      }
    }
  } catch (err) {
    onHandleError(err, dispatch);
  } finally {
    setInProgressAction(dispatch, false);
  }
};

/**
 * Sync Buyer with Optimal Blue
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const syncBuyerOBAction = async (loanID, dispatch) => {
  const controller = new AbortController();
  setInProgressAction(dispatch, true);

  try {
    const response = await syncBuyerOBAPI(loanID);

    if (response.status === 200) {
      dispatch({
        type: BUYER.buyerDetails,
        payload: {
          isLoading: false,
          buyerDetails: response.data.loan,
        },
      });
    }
  } finally {
    setInProgressAction(dispatch, false);
    controller.abort();
  }
};
