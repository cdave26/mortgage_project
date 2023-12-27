import { onHandleError } from "~/error/onHandleError";
import { getNumberOfUnitsAPI } from "./api";
import { NUMBER_OF_UNITS } from "./type";

export const getNumberOfUnitsAction = () => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      numberOfUnits: { data },
    } = getState();

    try {
      dispatch({
        type: NUMBER_OF_UNITS.listOfUnits,
        payload: { data, loading: true },
      });

      // intercept if there is a data stored already
      if (data.length) {
        return dispatch({
          type: NUMBER_OF_UNITS.listOfUnits,
          payload: { data, loading: false },
        });
      }

      const response = await getNumberOfUnitsAPI(signal);

      if (response.status === 200) {
        const transformed = response.data.units.map((item, idx) => {
          return {
            key: idx,
            value: item.id,
            label: item.description,
            disabled: false,
          };
        });

        dispatch({
          type: NUMBER_OF_UNITS.listOfUnits,
          payload: {
            loading: false,
            data: transformed,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };
};
