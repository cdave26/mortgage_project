import { PRICING_ENGINE } from './type';

const initialize = {
    pricing: {
        loading: false,
        data: [],
    },
};

const pricingEngine = (state = initialize, action) => {
    switch (action.type) {
        case PRICING_ENGINE.GET_PRICING_ENGINE:
            return {
                ...state,
                pricing: {
                    ...state.pricing,
                    loading: action.payload.loading,
                    data: action.payload.data,
                },
            };
        default:
            return state;
    }
};

export default pricingEngine;
