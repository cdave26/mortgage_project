import { defaultPagination } from "~/utils/constants";
import { LICENSES } from "./type";

const initialState = {
  listOfLicenses: {
    list: {},
    loading: false,
    page: 1,
    limit: defaultPagination.pageSize,
    search: "",
    stateId: "",
    sortBy: "",
    order: "",
  },
  updateLicense: {
    isEdit: false,
    license: {},
    loading: false,
  },
  licensesPerState: {
    loading: false,
    data: [],
  },
  licenseStatesPerUser: {
    loading: false,
    data: [],
  },
};

const licenses = (state = initialState, action) => {
  switch (action.type) {
    case LICENSES.listOfLicenses:
      return {
        ...state,
        listOfLicenses: {
          list: action.payload.list,
          loading: action.payload.loading,
          page: action.payload.page,
          limit: action.payload.limit,
          search: action.payload.search,
          stateId: action.payload.stateId,
          sortBy: action.payload.sortBy,
          order: action.payload.order,
        },
      };
    case LICENSES.licensesPerState:
      return {
        ...state,
        licensesPerState: {
          ...state.licensesPerState,
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    case LICENSES.licenseStatesPerUser:
      return {
        ...state,
        licenseStatesPerUser: {
          ...state.licenseStatesPerUser,
          data: action.payload.data,
          loading: action.payload.loading,
        },
      };
    case LICENSES.onSearchTyping:
      return {
        ...state,
        listOfLicenses: {
          ...state.listOfLicenses,
          search: action.payload,
          loading: true,
        },
      };
    case LICENSES.isEdit:
      return {
        ...state,
        updateLicense: {
          ...state.updateLicense,
          isEdit: action.payload,
        },
      };
    case LICENSES.selectedLicense:
      return {
        ...state,
        updateLicense: {
          ...state.updateLicense,
          license: action.payload,
          loading: false,
        },
      };
    case LICENSES.onProgress:
      return {
        ...state,
        updateLicense: {
          ...state.updateLicense,
          loading: action.payload,
        },
      };
    case LICENSES.deleteLicense:
      const filtered = state.listOfLicenses.list.data.filter(
        (item) => item.id !== action.payload
      );
      return {
        ...state,
        listOfLicenses: {
          ...state.listOfLicenses,
          list: {
            ...state.listOfLicenses.list,
            data: filtered,
            total: filtered.length,
          },
        },
      };
    default:
      return state;
  }
};

export default licenses;
