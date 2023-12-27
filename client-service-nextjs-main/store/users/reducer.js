import { defaultPagination } from "~/utils/constants";
import { USERS } from "./type";

const initialState = {
  listOfUsers: {
    list: {},
    loading: false,
    page: 1, // default page
    limit: defaultPagination.pageSize, // default limit
    search: "", // default search
    companyId: "", // default company id
    priceEngineId: "", // default price engine id
    userType: null, // default user type
    sortBy: "",
    filteredBy: "",
  },
  updateUser: {
    isEdit: false,
    user: {},
    loading: false,
  },
  usersPerCompany: {
    list: [],
    loading: false,
  },
  updateUserLicense: {
    openModal: false,
    license: null,
  },
};

const users = (state = initialState, action) => {
  switch (action.type) {
    case USERS.listOfUsers:
      return {
        ...state,
        listOfUsers: {
          list: action.payload.list,
          loading: action.payload.loading,
          page: action.payload.page,
          limit: action.payload.limit,
          search: action.payload.search,
          companyId: action.payload.companyId,
          priceEngineId: action.payload.priceEngineId,
          userType: action.payload.userType,
          sortBy: action.payload.sortBy,
          filteredBy: action.payload.filteredBy,
        },
      };
    case USERS.onSearchTyping:
      return {
        ...state,
        listOfUsers: {
          ...state.listOfUsers,
          search: action.payload,
          loading: true,
        },
      };

    case USERS.isEdit:
      return {
        ...state,
        updateUser: {
          ...state.updateUser,
          isEdit: action.payload,
        },
      };
    case USERS.userToUpdate:
      return {
        ...state,
        updateUser: {
          ...state.updateUser,
          user: action.payload,
          loading: false,
        },
      };
    case USERS.onProgress:
      return {
        ...state,
        updateUser: {
          ...state.updateUser,
          loading: action.payload,
        },
      };

    case USERS.deletedUser:
      return {
        ...state,
        listOfUsers: {
          ...state.listOfUsers,
          list: {
            ...state.listOfUsers.list,
            data: state.listOfUsers.list.data.filter(
              (item) => item.id !== action.payload
            ),
          },
        },
      };
    case USERS.usersPerCompany: {
      return {
        ...state,
        usersPerCompany: {
          list: action.payload.list,
          loading: action.payload.loading,
        },
      };
    }
    case USERS.updateUserLicense:
      return {
        ...state,
        updateUserLicense: action.payload,
      }
    default:
      return state;
  }
};

export default users;
