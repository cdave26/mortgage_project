import { onHandleError } from "~/error/onHandleError";
import { getPricingEngineAPI } from "./api";
import { PRICING_ENGINE } from "./type";

/**
 * Get pricing engine
 * @returns {void}
 */

export const getPricingEngineAction = () => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      pricingEngine: {
        pricing: { data },
      },
    } = getState();
    try {
      dispatch({
        type: PRICING_ENGINE.GET_PRICING_ENGINE,
        payload: { data, loading: true },
      });

      // intercept if there is a data stored already
      if (data.length) {
        return dispatch({
          type: PRICING_ENGINE.GET_PRICING_ENGINE,
          payload: { data, loading: false },
        });
      }

      const response = await getPricingEngineAPI(signal);

      if (response.status === 200) {
        const defualfLabel = {
          value: "Select Price Engine",
          label: "Select Price Engine",
          disabled: true,
        };
        const newArr = response.data.pricing_engines.map((item) => {
          return {
            value: item.id,
            label: item.name,
            disabled: false,
          };
        });
        // newArr.unshift(defualfLabel);
        dispatch({
          type: PRICING_ENGINE.GET_PRICING_ENGINE,
          payload: {
            loading: false,
            data: newArr,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};
