import { defaultPagination } from "~/utils/constants";
import { FLYERS } from "./type";

const initialState = {
  listOfFlyerTemplates: {
    list: {},
    page: 1,
    limit: FLYERS.FLYER_TEMPLATE_SIZE,
  },
  listOfFlyers: {
    data: {},
    loading: true,
    page: 1,
    limit: defaultPagination.pageSize,
    sortBy: "",
    search: "",
    addressSearch: "",
    activeArchive: "",
    created_by: "",
    companyId: null,
  },
  listOfCreatedBy: [],
  listingFlyersModal: false,
};

const flyers = (state = initialState, action) => {
  switch (action.type) {
    case FLYERS.GET_ALL_FLYER_TEMPLATES:
      return {
        ...state,
        listOfFlyerTemplates: {
          ...state.listOfFlyerTemplates,
          ...action.payload,
        },
      };
    case FLYERS.GET_ALL_FLYERS:
      return {
        ...state,
        listOfFlyers: {
          ...state.listOfFlyers,
          ...action.payload,
        },
      };
    case FLYERS.ON_SEARCH:
      return {
        ...state,
        listOfFlyers: {
          ...state.listOfFlyers,
          loading: true,
        },
      };
    case FLYERS.LIST_OF_CREATED_BY:
      return {
        ...state,
        listOfCreatedBy: action.payload,
      };
    case FLYERS.LISTING_FLYERS_MODAL:
      return {
        ...state,
        listingFlyersModal: action.payload,
      };
    default:
      return state;
  }
};

export default flyers;
