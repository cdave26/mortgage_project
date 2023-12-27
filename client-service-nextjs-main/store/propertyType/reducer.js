import { PROPERTYTYPE } from "./type";

const initialState = {
  items: [],
};

const propertyType = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case PROPERTYTYPE.propertyTypeList:
      return {
        ...state,
        items: payload,
      };

    default:
      return state;
  }
};
export default propertyType;
