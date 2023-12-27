import { defaultPagination } from "~/utils/constants";
import { LISTINGS } from "./type";

const initialState = {
  listOfListings: {
    list: {},
    loading: false,
    page: 1,
    limit: defaultPagination.pageSize,
    search: "",
    sortBy: "",
    order: "",
  },
  listOfListingActivityLogs: {
    list: {},
    loading: false,
    page: 1,
    limit: defaultPagination.pageSize,
    sortBy: "",
    order: "",
  },
  updateListing: {
    isEdit: false,
    listing: {},
    listingToUpdate: {},
    loading: false,
  },
  listingGeneratedFlyer: {
    data: [],
    loading: false,
  },
};

const listings = (state = initialState, action) => {
  switch (action.type) {
    case LISTINGS.listOfListings:
      return {
        ...state,
        listOfListings: {
          list: action.payload.list,
          loading: action.payload.loading,
          page: action.payload.page,
          limit: action.payload.limit,
          search: action.payload.search,
          sortBy: action.payload.sortBy,
          order: action.payload.order,
        },
      };
    case LISTINGS.listOfListingActivityLogs:
      return {
        ...state,
        listOfListingActivityLogs: {
          list: action.payload.list,
          loading: action.payload.loading,
          page: action.payload.page,
          limit: action.payload.limit,
          sortBy: action.payload.sortBy,
          order: action.payload.order,
        },
      };
    case LISTINGS.listingGeneratedFlyer:
      return {
        ...state,
        listingGeneratedFlyer: {
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    case LISTINGS.onSearchTyping:
      return {
        ...state,
        listOfListings: {
          ...state.listOfListings,
          search: action.payload,
          loading: true,
        },
      };
    case LISTINGS.isEdit:
      return {
        ...state,
        updateListing: {
          ...state.updateListing,
          isEdit: action.payload,
        },
      };
    case LISTINGS.selectedListing:
      return {
        ...state,
        updateListing: {
          ...state.updateListing,
          listing: action.payload,
          loading: false,
        },
      };
    case LISTINGS.listingToUpdate:
      return {
        ...state,
        updateListing: {
          ...state.updateListing,
          listingToUpdate: action.payload,
          loading: false,
        },
      };
    case LISTINGS.onProgress:
      return {
        ...state,
        updateListing: {
          ...state.updateListing,
          loading: action.payload,
        },
      };
    case LISTINGS.deleteListing:
      const filtered = state.listOfListings.list.data.filter(
        (item) => item.id !== action.payload
      );
      return {
        ...state,
        listOfListings: {
          ...state.listOfListings,
          list: {
            ...state.listOfListings.list,
            data: filtered,
            total: filtered.length,
          },
        },
      };
    default:
      return state;
  }
};

export default listings;
