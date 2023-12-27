import { defaultPagination } from "~/utils/constants";
import { OPTIMAL_BLUE } from "./type";

const initialState = {
  companyId: null,
  companyStrategy: {
    list: [],
    originator_list: [],
    options: [],
    company_account_id: null,
    loading: false,
    page: 1,
    limit: defaultPagination.pageSize,
    search: "",
    searchUserType: "",
    sortBy: "",
    order: "",
    total: 0,
  },
  companyDefaultStrategy: {
    data: {},
    loading: false,
  },
  updateUserStrategy: {
    userToUpdate: {},
    loading: false,
    mode: "",
    id: null,
  },
  massUpdateUserStrategy: {
    dataToUpdate: [],
    showMassModal: false,
    mode: "",
  },
};

const optimalBlue = (state = initialState, action) => {
  switch (action.type) {
    case OPTIMAL_BLUE.companyId:
      return {
        ...state,
        companyId: action.payload,
      };
    case OPTIMAL_BLUE.companyStrategy:
      return {
        ...state,
        companyStrategy: {
          list: action.payload.list,
          originator_list: action.payload.originator_list,
          options: action.payload.options,
          loading: action.payload.loading,
          company_account_id: action.payload.company_account_id,
          page: action.payload.page,
          limit: action.payload.limit,
          search: action.payload.search,
          searchUserType: action.payload.searchUserType,
          sortBy: action.payload.sortBy,
          order: action.payload.order,
          total: action.payload.total,
          companyId: action.payload.companyId,
        },
      };
    case OPTIMAL_BLUE.onSearchStrategy:
      return {
        ...state,
        companyStrategy: {
          ...state.companyStrategy,
          search: action.payload,
          loading: true,
        },
      };
    case OPTIMAL_BLUE.companyDefaultStrategy:
      return {
        ...state,
        companyDefaultStrategy: {
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    case OPTIMAL_BLUE.companyLatestStrategy:
      return {
        ...state,
        companyStrategy: {
          ...state.companyStrategy,
          company_account_id: action.payload.company_account_id,
          originator_list: action.payload.originator_list,
          options: action.payload.options,
          loading: action.payload.loading,
        },
      };
    case OPTIMAL_BLUE.onProgressDefaultStrategy:
      return {
        ...state,
        companyDefaultStrategy: {
          ...state.companyDefaultStrategy,
          loading: action.payload,
        },
      };
    case OPTIMAL_BLUE.onProgressUpdateUserStrategy:
      return {
        ...state,
        updateUserStrategy: {
          ...state.updateUserStrategy,
          loading: action.payload,
        },
      };
    case OPTIMAL_BLUE.selectedUserStrategy:
      return {
        ...state,
        updateUserStrategy: {
          ...state.updateUserStrategy,
          userToUpdate: action.payload.strategy,
          mode: action.payload.mode,
          loading: false,
          id: action.payload.id,
        },
      };
    case OPTIMAL_BLUE.massSelectedUserStrategy:
      return {
        ...state,
        massUpdateUserStrategy: {
          ...state.massUpdateUserStrategy,
          dataToUpdate: action.payload,
        },
      };
    case OPTIMAL_BLUE.massUpdateModal:
      return {
        ...state,
        massUpdateUserStrategy: {
          ...state.massUpdateUserStrategy,
          showMassModal: action.payload.showModal,
          mode: action.payload.mode,
        },
      };
    default:
      return state;
  }
};

export default optimalBlue;
