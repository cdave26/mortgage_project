import { UI } from "./type";

const initialize = {
  snackbars: {
    open: false,
    message: "",
    description: "",
    position: "", //top | bottom
    type: "", //error | success | warning | info
  },
  modal: {
    open: false,
    title: "",
    // type: '', //confirm | delete
    // icon: null,
    // content: '',
  },
  sideBarMenu: [],
  isRendered: true,
  isSpinning: false, // for HOC spinner
  stepper: {
    loading: true,
    completeOnboarding: false,
    step: 1,
  },
  formChange: {
    isChange: false,
    isModalOpen: false,
    url: "",
  },
};

const ui = (state = initialize, action) => {
  switch (action.type) {
    case UI.snackbars:
      return {
        ...state,
        snackbars: action.payload,
      };

    case UI.modal:
      return {
        ...state,
        modal: action.payload,
      };
    case UI.sideBarMenu:
      return {
        ...state,
        sideBarMenu: action.payload,
      };

    case UI.isRendered:
      return {
        ...state,
        isRendered: action.payload,
      };
    case UI.isSpinning:
      return {
        ...state,
        isSpinning: action.payload,
      };
    case UI.stepper:
      return {
        ...state,
        stepper: action.payload,
      };
    case UI.formChange:
      localStorage.setItem(
        "formChange",
        JSON.stringify({
          isChange: action.payload.isChange,
          url: window.location.pathname,
        })
      );
      return {
        ...state,
        formChange: action.payload,
      };
    default:
      return state;
  }
};

export default ui;
