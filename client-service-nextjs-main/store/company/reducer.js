import { defaultPagination } from "~/utils/constants";
import { COMPANY } from "./type";

const initialState = {
  //use for select option
  companyList: {
    company: [],
    loading: false,
  },
  //use for table
  list: {
    company: {},
    loading: true,
    name: "",
    company_nmls_number: "",
    state: "",
    page: 1,
    limit: defaultPagination.pageSize,
    sortBy: "",
  },
  myCompany: {
    company: {},
    loading: true,
    isUpdate: false,
  },
  hubspot_company_list: {
    company: [],
    loading: false,
  },
  companyLogoDetails: {
    link: "",
    name: "",
    loading: false,
  },
};

const company = (state = initialState, action) => {
  switch (action.type) {
    case COMPANY.getCompanyListById:
      return {
        ...state,
        companyList: {
          ...state.companyList,
          loading: action.payload.loading,
          company: action.payload.company,
        },
      };
    case COMPANY.company:
      return {
        ...state,
        list: Object.assign({}, state.list, action.payload),
        myCompany: {
          ...state.myCompany,
          isUpdate: false,
          loading: true,
          company: {},
        },
      };
    case COMPANY.onTyping:
      return {
        ...state,
        list: Object.assign({}, state.list, action.payload),
      };

    case COMPANY.myCompany:
      return {
        ...state,
        myCompany: Object.assign({}, state.myCompany, action.payload),
      };
    case COMPANY.deletedCompany:
      return {
        ...state,
        list: {
          ...state.list,
          company: {
            ...state.list.company,
            data: state.list.company.data.filter(
              (item) => item.id !== action.payload.id
            ),
          },
        },
      };
    case COMPANY.getHubspotCompanyList:
      return {
        ...state,
        hubspot_company_list: Object.assign(
          {},
          state.hubspot_company_list,
          action.payload
        ),
      };
    case COMPANY.getCompanyLogo:
      return {
        ...state,
        companyLogoDetails: action.payload,
      };
    case COMPANY.getCompanyByCode:
      return {
        ...state,
        myCompany: {
          ...state.myCompany,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};

export default company;
