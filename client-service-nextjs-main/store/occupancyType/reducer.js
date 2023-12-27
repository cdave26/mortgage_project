import { OCCUPANCYTYPE } from "./type";

const initialState = {
  items: [],
};

const occupancyType = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case OCCUPANCYTYPE.occupancyTypeList:
      return {
        ...state,
        items: payload,
      };

    default:
      return state;
  }
};
export default occupancyType;
