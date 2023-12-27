import { defaultPagination } from "~/utils/constants";
import { BUYER } from "./type";

const initialState = {
  buyerDetails: {},
  list: {
    buyers: [],
    page: 1,
    pageLimit: defaultPagination.pageSize,
    total: 0,
  },
  filter: {
    property_type: [],
    state: [],
    order_by: [],
  },
  isLoading: true,
};

const buyer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case BUYER.buyerList:
      return {
        ...state,
        list: {
          buyers: payload.buyers,
          page: payload.page,
          pageLimit: payload.pageLimit,
          total: payload.total,
        },
        isLoading: payload.isLoading,
      };
    case BUYER.buyerDetails:
      return {
        ...state,
        buyerDetails: payload.buyerDetails,
        isLoading: payload.isLoading,
      };
    case BUYER.deleteBuyer:
      return {
        ...state,
        list: {
          ...state.list,
          buyers: state.list.buyers.filter((item) => item.id !== payload.id),
        },
      };
    case BUYER.updateBuyer:
      return {
        ...state,
        buyerDetails: payload.data,
      };
    case BUYER.inProgress:
      return {
        ...state,
        isLoading: payload,
      };
    case BUYER.buyerFilters:
      return {
        ...state,
        filter: payload,
      };
    default:
      return state;
  }
};
export default buyer;
