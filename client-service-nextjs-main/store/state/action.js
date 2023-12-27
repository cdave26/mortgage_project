import { onHandleError } from "~/error/onHandleError";
import { getStatesAPI, getStatesPerCompanyAPI } from "./api";
import { STATES } from "./type";

export const resetStateAction = (dispatch) => {
  dispatch({
    type: STATES.GET_STATES_PER_COMPANY,
    payload: {
      loading: false,
      data: [],
    },
  });
};

const transformData = (data, selectedLabel) => {
  return data.map((item) => {
    return {
      key: item.id,
      value: item[selectedLabel],
      label: item[selectedLabel],
      full_name: item.full_name,
      disabled: false,
      metadata: null, //item.metadata,
    };
  });
};

/**
 * Get states
 * @returns {void}
 */
export const getStatesAction = (selectedLabel = "full_name") => {
  return async (dispatch) => {
    try {
      const controller = new AbortController();
      const { signal } = controller;
      dispatch({
        type: STATES.GET_STATES,
        payload: { loading: true, data: [] },
      });

      const response = await getStatesAPI(signal);
      if (response.status === 200) {
        dispatch({
          type: STATES.GET_STATES,
          payload: {
            loading: false,
            data: transformData(response.data.states, selectedLabel),
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };
};

/**
 * Get states
 * @returns {void}
 */
export const getStatesPerCompanyAction = (
  companyId,
  selectedLabel = "full_name"
) => {
  return async (dispatch) => {
    try {
      const controller = new AbortController();
      const { signal } = controller;
      dispatch({
        type: STATES.GET_STATES_PER_COMPANY,
        payload: {
          loading: true,
          data: [],
        },
      });

      const response = await getStatesPerCompanyAPI(
        companyId,
        selectedLabel,
        signal
      );

      if (response.status === 200) {
        dispatch({
          type: STATES.GET_STATES_PER_COMPANY,
          payload: {
            loading: false,
            data: transformData(response.data.companyStates, selectedLabel),
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };
};
