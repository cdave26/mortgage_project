import { LOANOFFICER } from './type';

const initialState = {
  loanOfficerDetails: {},
  licensedStates: [],
  isLoading: true,
};

const loanOfficer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case LOANOFFICER.loanOfficerDetails:
      return {
        ...state,
        loanOfficerDetails: payload.details,
        isLoading: payload.isLoading,
        licensedStates: payload.licensedStates,
      };
    case LOANOFFICER.inProgress:
      return {
        ...state,
        isLoading: payload,
      };
    default:
      return state;
  }
};
export default loanOfficer;
