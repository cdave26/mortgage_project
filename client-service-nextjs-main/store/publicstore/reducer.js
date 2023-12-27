import { PUBLIC_STORE } from "./type";

//public store
const initialize = {
  publicListing: {
    data: {},
    loading: false,
  },
  publicQuickQuote: {
    data: {},
    loading: false,
    hasResult: false,
    sellerCredits: 0,
    selectedState: null,
    showInquiryModal: false,
    resultsData: {},
  },
  publicAgentListing: {
    loanOfficerData: {},
    loading: false,
    showInquiryModal: false,
    showSuccessModal: false,
    successMessage: "",
  },
};

const publicStore = (state = initialize, action) => {
  switch (action.type) {
    case PUBLIC_STORE.publicListing:
      return {
        ...state,
        publicListing: {
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    case PUBLIC_STORE.publicQuickQuote:
      return {
        ...state,
        publicQuickQuote: {
          ...state.publicQuickQuote,
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    case PUBLIC_STORE.publicQuickQuoteStates:
      return {
        ...state,
        publicQuickQuote: {
          ...state.publicQuickQuote,
          ...action.payload,
        },
      };
    case PUBLIC_STORE.publicAgentListing:
      return {
        ...state,
        publicAgentListing: {
          ...state.publicAgentListing,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export default publicStore;
