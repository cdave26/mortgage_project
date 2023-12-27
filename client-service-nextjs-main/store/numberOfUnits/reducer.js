import { NUMBER_OF_UNITS } from "./type";

const initialState = {
  loading: false,
  data: [],
};

const numberOfUnits = (state = initialState, action) => {
  switch (action.type) {
    case NUMBER_OF_UNITS.listOfUnits:
      return {
        ...state,
        loading: action.payload.loading,
        data: action.payload.data,
      };

    default:
      return state;
  }
};
export default numberOfUnits;
