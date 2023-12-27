import { AUTH } from './type';

const initialize = {
    token: null,
    openForgotPasswordModal: false,
    openResetPasswordModal: false,
    openOtpModal: false,
    userEmail: null,
    data: {
        user: null,
        isAuthenticated: false,
    },
    userTypes: {
        loading: false,
        data: [],
    },
};

const auth = (state = initialize, action) => {
    switch (action.type) {
        case AUTH.token:
            return {
                ...state,
                // token: action.payload,
                data: {
                    ...state.data,
                    isAuthenticated: action.payload.isAuthenticated
                        ? true
                        : false,
                    user: action.payload.user || null,
                },
            };
        case AUTH.logout:
            return {
                ...state,
                data: {
                    user: null,
                    isAuthenticated: false,
                },
            };
        case AUTH.openForgotPasswordModal:
            return {
                ...state,
                openForgotPasswordModal: action.data,
            };
        case AUTH.openResetPasswordModal:
            return {
                ...state,
                openResetPasswordModal: action.data,
            };
        case AUTH.openOtpModal:
            return {
                ...state,
                openOtpModal: action.data,
            };
        case AUTH.userEmail:
            return {
                ...state,
                userEmail: action.data,
            };
        case AUTH.userTypes:
            return {
                ...state,
                userTypes: {
                    ...state.userTypes,
                    loading: action.payload.loading,
                    data: action.payload.data,
                },
            };
        case AUTH.userType:
            if (!state.data.user) {
                return {
                    ...state,
                    data: {
                        user: {
                            user_type: action.user_type,
                        },
                    },
                }
            }

            state.data.user = {
                ...state.data.user,
                user_type: action.user_type,
            }

            return state
        case AUTH.userMobileNumber:
            if (!state.data.user) {
                return {
                    ...state,
                    data: {
                        user: {
                            mobile_number: action.mobile_number,
                        },
                    },
                }
            }

            state.data.user = {
                ...state.data.user,
                mobile_number: action.mobile_number,
            }

            return state
        default:
            return state;
    }
};

export default auth;
