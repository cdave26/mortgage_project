import { CREDITSCORERANGE } from "./type";

const initialState = {
  items: [],
};

const creditScoreRange = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case CREDITSCORERANGE.creditScoreRangeList:
      return {
        ...state,
        items: payload,
      };

    default:
      return state;
  }
};
export default creditScoreRange;
