import { onHandleError } from "~/error/onHandleError";
import {
  getUserListAPI,
  checkEmailIsExistAPI,
  createUserAPI,
  getUserByIdAPI,
  updateUserAPI,
  deleteUserAPI,
  getUsersPerCompanyAPI,
  completeOnboardingAPI,
  checkUserAPI,
  getFullUserListAPI,
  checkUserDetailsAPI
} from "./api";
import { USERS } from "./type";
import { dateTimeFormat } from "~/plugins/dateTimeFormat";
import Router from "next/router";
import * as jose from "jose";
import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { FLYERS } from "../flyers/type";
import {
  formChangeRemove,
  formDialogAlert,
  removeDraftsFrom,
} from "../ui/action";
/**
 * Get user list
 * @param {Object} query
 * @returns {void}
 */

export const getUserListAction = ({
  page,
  limit,
  search,
  companyId,
  priceEngineId,
  userType,
  sortBy,
  filteredBy,
}) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const { auth, users } = getState(),
      { data } = auth,
      { listOfUsers } = users;
    if (data.user) {
      try {
        dispatch({
          type: USERS.listOfUsers,
          payload: {
            loading: true,
            list:
              Object.keys(listOfUsers.list).length > 0 ? listOfUsers.list : {},
            page,
            limit,
            search,
            companyId,
            priceEngineId,
            userType,
            sortBy,
            filteredBy,
          },
        });

        const response = await getUserListAPI(
          data.user.id,
          data.user.company_id,
          page,
          limit,
          signal,
          search,
          companyId,
          priceEngineId,
          userType,
          sortBy,
          filteredBy
        );

        if (response.status === 200) {
          const newData = {
            ...response.data,
            data:
              response.data.data.length > 0
                ? response.data.data.map((item) => {
                    return {
                      ...item,
                      key: String(item.id),
                      //   companyName: item.company.name,
                      created_at: item.created_at
                        ? dateTimeFormat(item.created_at, "MM DD YYYY")
                        : null,

                      user_type_name: item.user_type_name
                        .replace(/_/g, " ")
                        .replace(
                          /\w\S*/g,
                          (txt) =>
                            txt.charAt(0).toUpperCase() +
                            txt.substr(1).toLowerCase()
                        ),
                      //   updated_at: item.updated_at
                      //       ? dateTimeFormat(
                      //             item.updated_at,
                      //             'MM DD YYYY'
                      //         )
                      //       : null,
                      //   deleted_at: item.deleted_at
                      //       ? dateTimeFormat(
                      //             item.deleted_at,
                      //             'MM DD YYYY'
                      //         )
                      //       : null,
                      //   pricing_engine_id:
                      //       item.pricing_engine.name,
                      //   typeOfUser:
                      //       item.user_type_id == 1
                      //           ? 'Uplist Admin'
                      //           : item.user_type_id == 2
                      //           ? 'Company Admin'
                      //           : 'Loan Officer',
                    };
                  })
                : response.data.data,
          };

          dispatch({
            type: USERS.listOfUsers,
            payload: {
              loading: false,
              list: newData,
              page: newData.current_page,
              limit: newData.per_page,
              search,
              companyId,
              priceEngineId,
              userType,
              sortBy,
              filteredBy,
            },
          });
        }
      } catch (error) {
        onHandleError(error, dispatch);
      } finally {
        controller.abort();
      }
    } else {
      throw new Error("User not found");
    }
  };
};

/**
 * Check if the email is already exist
 * @param {String} email
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const checkEmailIsExistAction = async (email, signal) => {
  return await checkEmailIsExistAPI(email, signal);
};

/**
 * Create user Action
 * @param {Object} user
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */

export const createUserAction = (user, signal) => {
  return async (_, getState) => {
    const { auth } = getState(),
      { data } = auth;
    if (data.user) {
      if (data.user.user_type_id != 1) {
        user.company_id = data.user.company_id;
      }
      const formData = new FormData();

      for (const key in user) {
        formData.append(key, user[key]);
      }

      return await createUserAPI(formData, signal);
    } else {
      throw new Error("User not found");
    }
  };
};

/**
 * ON SEARCH TYPING
 * @param {String} search
 * @returns {void}
 */

export const onSearchTypingAction = (search) => {
  return (dispatch) => {
    dispatch({
      type: USERS.onSearchTyping,
      payload: search,
    });
  };
};

/**
 * Is edit user
 * @param {Boolean} isEdit
 * @returns {void}
 */
export const isEditUserAction = (isEdit) => {
  return (dispatch) => {
    dispatch({
      type: USERS.isEdit,
      payload: isEdit,
    });
  };
};

/**
 * User to update
 * @param {Object} user
 * @returns {void}
 */
export const userToUpdateAction = (user) => {
  return (dispatch) => {
    dispatch({
      type: USERS.userToUpdate,
      payload: user,
    });
  };
};

/**
 * Get user
 * @param {String} id
 * @returns {void}
 */
export const getUserAction = (id) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const { auth } = getState(),
      { data } = auth;
    if (data.user) {
      try {
        const response = await getUserByIdAPI(
          data.user.company_id,
          Number(id),
          signal
        );
        if (response.status === 200) {
          dispatch(userToUpdateAction(response.data));
        }
      } catch (error) {
        onHandleError(error, dispatch, null, "/users");
      } finally {
        controller.abort();
      }
    }
  };
};

/**
 * Update user details
 * @param {Object} user
 * @param {Boolean} complete
 * @param {Object} form
 * @returns {void}
 */

export const updateUserAction = (user, complete = false, form) => {
  if (typeof complete !== "boolean") {
    throw new Error("complete must be boolean");
  }

  if (typeof user !== "object") {
    throw new Error("user must be object");
  }

  if (typeof form !== "object") {
    throw new Error("form must be object");
  }

  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      auth,
      ui: { stepper },
    } = getState();
    try {
      dispatch({
        type: USERS.onProgress,
        payload: true,
      });
      const formData = new FormData();
      for (const key in user) {
        formData.append(key, user[key]);
      }
      const response = await updateUserAPI(user, signal);
      if (response.status === 200) {
        if (
          auth.data.user.iscomplete_onboarding === 1 &&
          [2, 3].includes(Number(auth.data.user.user_type_id))
        ) {
          dispatch({
            type: "token",
            payload: {
              user: {
                ...auth.data.user,
                ...response.data.user,
              },
              isAuthenticated: true,
            },
          });
          const secret = new TextEncoder().encode(process.env.SECURITY_APP);
          const token = await new jose.SignJWT({
            userData: {
              ...auth.data.user,
              ...response.data.user,
            },
          })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .sign(secret);
          onSetUplistCookies(token, true);

          const onboarding = localStorage.getItem("onboarding");

          const createOnboarding = (user) => {
            localStorage.setItem(
              "onboarding",
              JSON.stringify([
                {
                  id: user.id,
                  step: 2,
                },
              ])
            );
          };
          if (onboarding) {
            const onboardingData = JSON.parse(onboarding);
            const index = onboardingData.findIndex(
              (item) => item.id === user.id
            );

            // if (response.data.user.profile_logo) {
            //   localStorage.setItem(
            //     "profile_logo",
            //     response.data.user.profile_logo
            //   );
            // } else {
            //   localStorage.removeItem("profile_logo");
            // }

            if (index !== -1) {
              onboardingData[index].step = 2;
              localStorage.setItem(
                "onboarding",
                JSON.stringify(onboardingData)
              );

              dispatch({
                type: "UI/stepper",
                payload: {
                  ...stepper,
                  step: 2,
                },
              });
            } else {
              createOnboarding();
            }
          } else {
            createOnboarding();
          }
        } else {
          renderuser(false, response, auth, dispatch, user);
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message:
                response.data.user.id === auth.data.user.id
                  ? "You have updated your profile."
                  : response.data.message,
              description: "",
              position: "topRight",
              type: "success",
            },
          });
          dispatch(formDialogAlert(false, false, ""));

          formChangeRemove();
          /**
           * form data to remove draft
           */
          // removeDraftsFrom("users");
        }
      }
    } catch (error) {
      dispatch(formDialogAlert(false, false, ""));
      formChangeRemove();
      dispatch({
        type: USERS.onProgress,
        payload: false,
      });
      dispatch(getUserAction(user.id));
      if (error.response) {
        if (error.response.hasOwnProperty("data")) {
          if (error.response.data.hasOwnProperty("errors")) {
            const { errors } = error.response.data;
            const scrollToTheFirstError = Object.keys(errors)[0];
            for (const key in errors) {
              form.setFields([
                {
                  name: key,
                  errors: [errors[key]],
                },
              ]);
            }
            form.scrollToField(scrollToTheFirstError);
            return;
          }
        }
      }
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * Delete user
 * @param {Object} user
 * @returns {Promise<AxiosResponse<T>>}
 */

export const deleteUserAction = (user) => {
  return async (dispatch, _) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      const response = await deleteUserAPI(user.id, user.company_id, signal);
      if (response.status === 200) {
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: response.data.message,
            description: "",
            position: "topRight",
            type: "success",
          },
        });
        dispatch({
          type: USERS.deletedUser,
          payload: user.id,
        });
        return response;
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

export const getUsersPerCompanyAction = (companyId) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      dispatch({
        type: USERS.usersPerCompany,
        payload: {
          loading: true,
          list: [],
        },
      });

      const response = await getUsersPerCompanyAPI(companyId, signal);
      if (response.status === 200) {
        const transformed = response.data.users.map((item) => {
          return {
            ...item,
            key: item.id,
            value: item.id,
            label: `${item.first_name} ${item.last_name}`,
          };
        });
        dispatch({
          type: USERS.usersPerCompany,
          payload: {
            list: transformed,
            loading: false,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: USERS.usersPerCompany,
        payload: {
          list: [],
          loading: false,
        },
      });
    } finally {
      controller.abort();
    }
  };
};

/**
 * Complete on boarding
 * @param {Boolean} skip
 * @returns {void}
 */

export const completeOnboardingAction = (skip = false) => {
  if (typeof skip !== "boolean") {
    throw new Error("skip must be boolean");
  }

  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const {
      ui: { stepper },
      auth,
    } = getState();

    if (skip) {
      dispatch({
        type: "UI/stepper",
        payload: {
          ...stepper,
          completeOnboarding: true,
        },
      });
    }

    try {
      const response = await completeOnboardingAPI(signal);
      if (response.status === 200) {
        const onboarding = localStorage.getItem("onboarding");

        if (onboarding) {
          const onboardingData = JSON.parse(onboarding);
          const index = onboardingData.findIndex(
            (item) => item.id === auth.data.user.id
          );
          if (index !== -1) {
            onboardingData.splice(index, 1);
            localStorage.setItem("onboarding", JSON.stringify(onboardingData));
          }
        }

        if (!skip) {
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: "You have completed the onboarding process",
              description: "",
              position: "topRight",
              type: "success",
            },
          });
        }
        setTimeout(
          () => {
            renderuser(true, response, auth, dispatch);
          },
          skip ? 0 : 500
        );
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: "UI/stepper",
        payload: {
          ...stepper,
          completeOnboarding: false,
        },
      });
    }
  };
};

const renderuser = async (
  isOnboarding,
  response,
  auth,
  dispatch,
  user = {}
) => {
  if (response.data.user.id === auth.data.user.id) {
    if (!isOnboarding) {
      dispatch({
        type: "token",
        payload: {
          user: {
            ...auth.data.user,
            ...response.data.user,
          },
          isAuthenticated: true,
        },
      });
      if ("serviceWorker" in navigator) {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            channelName: "updateAuthProfile",
            message: {
              ...auth.data.user,
              ...response.data.user,
            },
          });
        }
      }
    }

    if (isOnboarding) {
      response.data.user = {
        ...auth.data.user,
        iscomplete_onboarding: 0,
      };
    }

    const secret = new TextEncoder().encode(process.env.SECURITY_APP);
    const token = await new jose.SignJWT({
      userData: {
        ...auth.data.user,
        ...response.data.user,
      },
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(secret);

    onSetUplistCookies(token, !isOnboarding);

    const onboarding = localStorage.getItem("onboarding");
    if (onboarding) {
      const onboardingData = JSON.parse(onboarding);
      if (onboardingData.length === 0) {
        localStorage.removeItem("onboarding");
      }
    }
  }

  if (!isOnboarding) {
    dispatch({
      type: USERS.onProgress,
      payload: false,
    });
    if (user.hasOwnProperty("id")) {
      dispatch(userToUpdateAction(response.data.user));
      Router.push(`/users/view/${user.id}`);
    }
    // Router.push(
    //   `${Number(auth.data.user.user_type_id) === 3 ? "/" : "/users"}`
    // );
  }
};

/**
 * Check if the user is exists or active/active trial
 * @param {Object} payload
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const checkUserAction = async (payload, signal) => {
  return await checkUserAPI(payload, signal);
};

/**
 * Check if the user is exists
 * @param {Object} payload
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const checkUserDetails = (payload, signal) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      const response = await checkUserDetailsAPI(payload, signal);
      dispatch({
        type: 'success',
        payload: response.data,
      });
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };
};

/**
 * Get all user's name action
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getFullUserListAction = (companyId = "") => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await getFullUserListAPI(companyId, signal);

      if (response.status === 200) {
        const resultCreadedBy = response.data.map((item) => {
          return {
            key: item.user_id,
            label: `${item.user_first_name} ${item.user_last_name}`,
            value: `${item.user_first_name} ${item.user_last_name}`,
            first_name: item.user_first_name,
            last_name: item.user_last_name,
          };
        });

        dispatch({
          type: FLYERS.LIST_OF_CREATED_BY,
          payload: resultCreadedBy,
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};
