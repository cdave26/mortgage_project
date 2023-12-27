import { PREAPPROVAL } from './type';

const initialState = {
  payments: null,
  isLoading: true,
  errorMessage: '',
};

const buyersPreApproval = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case PREAPPROVAL.getPayments:
      return {
        ...state,
        payments: payload?.payments,
        errorMessage: payload?.message,
      };
    case PREAPPROVAL.inProgress:
      return {
        ...state,
        isLoading: payload,
      };
    case PREAPPROVAL.setErrorMessage:
      return {
        ...state,
        errorMessage: payload,
      };
    default:
      return state;
  }
};
export default buyersPreApproval;
