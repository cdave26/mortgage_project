import { onHandleError } from "~/error/onHandleError";
import { getUserTypesAPI } from "./api";
import { AUTH } from "./type";

export const onOpenForgotPasswordModal = (data, dispatch) => {
  dispatch({
    type: AUTH.openForgotPasswordModal,
    data,
  });
};

export const onOpenResetPasswordModal = (data, dispatch) => {
  dispatch({
    type: AUTH.openResetPasswordModal,
    data,
  });
};

export const onOpenOtpModal = (data, dispatch) => {
  dispatch({
    type: AUTH.openOtpModal,
    data,
  });
};

export const onSetUserEmail = (data, dispatch) => {
  dispatch({
    type: AUTH.userEmail,
    data,
  });
};

/**
 * Get user types
 * @returns {void}
 */
export const getUserTypesAction = (excludeUplistAdmin = false) => {
  return async (dispatch, getState) => {
    try {
      const controller = new AbortController();
      const { signal } = controller;
      const { auth } = getState();
      dispatch({
        type: AUTH.userTypes,
        payload: { data: auth.userTypes.data, loading: true },
      });

      // intercept if there is a data stored already
      if (auth.userTypes.data.length) {
        return dispatch({
          type: AUTH.userTypes,
          payload: { data: auth.userTypes.data, loading: false },
        });
      }

      const getUserData = () => {
        let options = [
          "Uplist Admin",
          "Company Admin",
          "Loan Officer",
          "Buyer",
        ];

        switch (auth.data.user.user_type.name) {
          case "loan_officer":
            options = ["Loan Officer"];
            break;

          case "company_admin":
            options = ["Company Admin", "Loan Officer"];
            break;

          case "buyer":
            options = ["Buyer"];
            break;

          default:
            break;
        }

        if (excludeUplistAdmin) {
          options = ["Company Admin", "Loan Officer"];
        }

        return options;
      };

      const response = await getUserTypesAPI(signal);
      if (response.status === 200) {
        const defaultLabel = {
          value: "Select User Type",
          label: "Select User Type",
          disabled: true,
        };
        if (response.data.user_types.length > 0) {
          const newArr = response.data.user_types.map((item) => {
            return {
              value: item.id,
              label: item.name
                .replace(/_/g, " ")
                .replace(
                  /\w\S*/g,
                  (txt) =>
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                ),

              disabled: false,
            };
          });
          // newArr.unshift(defaultLabel);
          const selectOptions = getUserData();

          dispatch({
            type: AUTH.userTypes,
            payload: {
              loading: false,
              data: newArr.filter(
                (item) => selectOptions.includes(item.label)
                // data: newArr.filter((item) =>
                //   [...selectOptions, "Select User Type"].includes(item.label)
              ),
            },
          });
        }
      }
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };
};
