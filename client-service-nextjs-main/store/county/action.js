import { onHandleError } from "~/error/onHandleError";
import { getCountiesPerStateApi } from "./api";
import { COUNTIES } from "./type";

export const resetCountyAction = (dispatch) => {
  dispatch({
    type: COUNTIES.GET_COUNTIES_PER_STATE,
    payload: {
      loading: false,
      data: [],
    },
  });
};

export const getCountiesPerStateAction = (stateId) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      dispatch({
        type: COUNTIES.GET_COUNTIES_PER_STATE,
        payload: {
          loading: true,
          data: [],
        },
      });

      const response = await getCountiesPerStateApi(stateId, signal);

      if (response.status === 200) {
        const transformed = response.data.counties.map((item) => {
          return {
            key: item.id,
            value: item.name,
            label: item.name,
            disabled: false,
          };
        });

        dispatch({
          type: COUNTIES.GET_COUNTIES_PER_STATE,
          payload: {
            loading: false,
            data: transformed,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      resetCountyAction(dispatch);
    }
  };
};
