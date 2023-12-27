import { getLoanOfficerAPI } from './api';
import { LOANOFFICER } from './type';
import { onHandleError } from '~/error/onHandleError';

/**
 * Set Loading
 * @param {Boolean} payload
 */
export const setInProgressAction = (dispatch, payload) => {
  dispatch({
    type: LOANOFFICER.inProgress,
    payload: payload,
  });
};

/**
 * Get Loan officer Details
 * @param {Number} loanOfficerId
 * @param {AbortSignal} params.signal
 * @returns {Promise<AxiosResponse<T>>} Promise
 */
export const getLoanOfficerAction = (loanOfficerId) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    setInProgressAction(dispatch, true);
    try {
      const response = await getLoanOfficerAPI(loanOfficerId, signal);
      if (response.status === 200) {
        const loanOfficerDetails = response.data.loan_officer;
        const licenses = loanOfficerDetails.licenses;
        const initialLicensedStates = [];

        licenses.forEach((license) => {
          const state = {
            ...license.state,
            label: license.state.full_state,
            value: license.state.id,
            userStateLicense: license.license,
          };

          initialLicensedStates.push(state);
        });

        dispatch({
          type: LOANOFFICER.loanOfficerDetails,
          payload: {
            isLoading: false,
            details: response.data.loan_officer,
            licensedStates: initialLicensedStates,
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
