import { COUNTIES } from "./type";

const initialState = {
  countiesPerState: {
    data: [],
    loading: false,
  },
};

const counties = (state = initialState, action) => {
  switch (action.type) {
    case COUNTIES.GET_COUNTIES_PER_STATE:
      return {
        ...state,
        countiesPerState: {
          ...state.countiesPerState,
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    default:
      return state;
  }
};

export default counties;
