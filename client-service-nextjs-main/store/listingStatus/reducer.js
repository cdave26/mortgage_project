import { LISTING_STATUS } from "./type";

const initialState = {
  statuses: {
    loading: false,
    data: [],
  },
};

const listingStatus = (state = initialState, action) => {
  switch (action.type) {
    case LISTING_STATUS.listingStatusList:
      return {
        ...state,
        statuses: {
          ...state.statuses,
          loading: action.payload.loading,
          data: action.payload.data,
        },
      };

    default:
      return state;
  }
};
export default listingStatus;
