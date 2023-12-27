import {
  fetchBuyerPreApprovalPaymentAPI,
  requestBuyerPreApprovalPaymentAPI,
  sendEmailAPI,
} from "./api";
import { onHandleError } from "~/error/onHandleError";
import { PREAPPROVAL } from "./type";

/**
 * Set Loading
 * @param {Boolean} payload
 */
export const setPreApprovalInProgressAction = (dispatch, payload) => {
  dispatch({
    type: PREAPPROVAL.inProgress,
    payload: payload,
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
      description: null,
      position: "topRight",
      type,
    },
  });
};

/**
 * Request Payment action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const requestPaymentAction = async (body, user, dispatch) => {
  const controller = new AbortController();
  const { signal } = controller;

  if (user) {
    try {
      setPreApprovalInProgressAction(dispatch, true);
      const response = await fetchBuyerPreApprovalPaymentAPI(body, signal);
      if (response.status === 200) {
        const paymentDetails = response.data;

        dispatch({
          type: PREAPPROVAL.getPayments,
          payload: paymentDetails,
        });
        return response;
      } else {
        return setSnackBarAction(response, "error", dispatch);
      }
    } catch (error) {
      return onHandleError(error, dispatch);
    } finally {
      setPreApprovalInProgressAction(dispatch, false);
    }
  } else {
    setPreApprovalInProgressAction(dispatch, false);
    throw new Error("Auth user not found");
  }
};

export const setRequestPaymentAction = async (
  body,
  paymentDetails,
  propertyDetails,
  dispatch
) => {
  const controller = new AbortController();
  const { signal } = controller;
  try {
    setPreApprovalInProgressAction(dispatch, true);
    const response = await requestBuyerPreApprovalPaymentAPI(
      { ...body, payments: paymentDetails, ...propertyDetails },
      signal
    );

    if (response.status === 200) {
      window.location.href = "/buyer/success";
    } else {
      throw new Error(response);
    }
  } catch (error) {
    setSnackBarAction(error, "error", dispatch);
  } finally {
    setPreApprovalInProgressAction(dispatch, false);
  }
};

export const sendEmailAction = async (body, dispatch) => {
  const controller = new AbortController();
  const { signal } = controller;
  try {
    setPreApprovalInProgressAction(dispatch, true);
    const response = await sendEmailAPI(body, signal);

    if (response.status === 200) {
      setSnackBarAction(response, "success", dispatch);
    } else {
      throw new Error(response);
    }
  } catch (error) {
    setSnackBarAction(error, "error", dispatch);
  } finally {
    setPreApprovalInProgressAction(dispatch, false);
  }
};
