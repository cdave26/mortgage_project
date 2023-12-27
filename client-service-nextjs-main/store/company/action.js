import {
  onHandleError,
  onDispatchError,
  checkPath,
} from "~/error/onHandleError";

import {
  getCompanyListAPI,
  companyListAPI,
  getCompanyAPI,
  deleteCompanyAPI,
  createCompanyAPI,
  updateCompanyAPI,
  getHubspotCompanyAPI,
  getCompanyLogoAPI,
  searchCompanyAPI,
  getCompanyByCodeAPI,
} from "./api";
import { COMPANY } from "./type";
import { STATES } from "../state/type";
import * as jose from "jose";
import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import userTypes from "~/enums/userTypes";
import { formChangeRemove, formDialogAlert } from "../ui/action";

/**
 * Get company list by user id
 * @returns {void}
 */
export const getCompanyListByIdAction = () => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      dispatch({
        type: COMPANY.getCompanyListById,
        payload: {
          loading: true,
          company: [],
        },
      });

      const response = await getCompanyListAPI(signal);

      if (response.status === 200) {
        dispatch({
          type: COMPANY.getCompanyListById,
          payload: {
            loading: false,
            company: response.data.map((item) => {
              return {
                value: item.id,
                label: item.name,
                disabled: false,
                pricing_engine_id: item.pricing_engine_id,
                code: item.code,
                pricing_engine: {
                  label: item.pricing_engine.name,
                  value: item.pricing_engine.id,
                },
              };
            }),
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch, null, "/company");
    } finally {
      controller.abort();
    }
  };
};

/**
 * Get company list
 * @param {Object} obj
 * @returns {void}
 */

export const companyListAction = ({
  name,
  company_nmls_number,
  state,
  page,
  limit,
  sortBy,
}) => {
  return async (dispatch, getState) => {
    const { company } = getState();
    const controller = new AbortController();
    const { signal } = controller;
    try {
      dispatch({
        type: COMPANY.company,
        payload: {
          loading: true,
          company: company.list.company,
          name,
          company_nmls_number,
          state,
          page,
          limit,
          sortBy,
        },
      });
      const response = await companyListAPI(
        name,
        company_nmls_number,
        state,
        page,
        limit,
        sortBy,
        signal
      );
      if (response.status === 200) {
        dispatch({
          type: COMPANY.company,
          payload: {
            loading: false,
            company: {
              ...response.data,
              data: response.data.data.map((item) => {
                return {
                  ...item,
                  key: String(item.id),
                };
              }),
            },
            name,
            company_nmls_number,
            state,
            page,
            limit,
            sortBy,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * Get company
 * @param {Number} companyId
 * @param {Boolean} isUpdate
 * @returns {void}
 */
export const getCompanyAction = (companyId, isUpdate) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      dispatch({
        type: COMPANY.myCompany,
        payload: {
          loading: true,
          company: {},
          isUpdate,
        },
      });
      const response = await getCompanyAPI(companyId, signal);

      if (response.status === 200) {
        dispatch({
          type: COMPANY.myCompany,
          payload: {
            loading: false,
            company: response.data,
            isUpdate,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch, null, "/company");
    } finally {
      controller.abort();
    }
  };
};

/**
 * Delete company
 * @param {Number} companyId
 */
export const deleteCompanyAction = (companyId) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      const response = await deleteCompanyAPI(companyId, signal);
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
          type: COMPANY.deletedCompany,
          payload: {
            id: companyId,
          },
        });

        return true;
      }
    } catch (error) {
      onHandleError(error, dispatch, null, "/company");
      return false;
    } finally {
      controller.abort();
    }
  };
};

/**
 * Submit company FormData to API
 * @param {Object} formData
 * @param {Object} andfForm
 * @returns {Promise<Boolean>} true if success
 */
export const createCompanyAction = (formData, andfForm) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;
    const { auth } = getState();

    /**
     * alway make sure that the user is authenticated
     */

    if (auth.data.user.hasOwnProperty("id") && auth.data.isAuthenticated) {
      try {
        const response = await createCompanyAPI(formData, signal);
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
            type: STATES.RESET_SELECTED_STATE,
          });
          return true;
        }
      } catch (error) {
        dispatch(formDialogAlert(false, false, ""));
        formChangeRemove();
        onDispatchError(dispatch, "Error", error.response.data.message);
        if (error.response) {
          if (error.response.hasOwnProperty("data")) {
            if (
              error.response.data.hasOwnProperty("message") &&
              error.response.data.hasOwnProperty("errors")
            ) {
              const namesKey = [];
              const errors = error.response.data.errors;
              for (const [key, value] of Object.entries(errors)) {
                namesKey.push(key);
                andfForm.setFields([
                  {
                    name: key,
                    errors: value,
                  },
                ]);
              }
              //also scroll to the first error
              andfForm.scrollToField(namesKey[0]);

              return;
            }
          }
        }
        onHandleError(error, dispatch, null, "/company");
        return false;
      } finally {
        controller.abort();
      }
    }
  };
};

/**
 * Update company FormData to API
 * @param {Number} companyId
 * @param {Object} formData
 * @param {Object} andfForm
 * @returns {Promise<Boolean>} true if success
 */
export const updateCompanyAction = (companyId, formData, andfForm) => {
  return async (dispatch, getState) => {
    const userType = [1, 2];
    const controller = new AbortController();
    const { signal } = controller;
    const {
      auth,
      pricingEngine,
      ui: { stepper },
    } = getState();
    const jsonObject = {};

    formData.forEach((value, key) => {
      jsonObject[key] = value;
    });

    /**
     * alway make sure that the user is authenticated
     */

    if (auth.data.user.hasOwnProperty("id") && auth.data.isAuthenticated) {
      try {
        const response = await updateCompanyAPI(companyId, formData, signal);
        if (response.status === 200) {
          if (
            auth.data.user.iscomplete_onboarding === 1 &&
            [2, 3].includes(Number(auth.data.user.user_type_id))
          ) {
            const onboarding = localStorage.getItem("onboarding");
            const nextRun = () => {
              localStorage.setItem(
                "onboarding",
                JSON.stringify([
                  {
                    id: auth.data.user.id,
                    step: 3,
                  },
                ])
              );
            };

            if (onboarding) {
              const onboardingData = JSON.parse(onboarding);
              const index = onboardingData.findIndex(
                (item) => item.id === auth.data.user.id
              );
              if (index !== -1) {
                onboardingData[index].step = 3;
                localStorage.setItem(
                  "onboarding",
                  JSON.stringify(onboardingData)
                );
                dispatch({
                  type: "UI/stepper",
                  payload: {
                    ...stepper,
                    step: 3,
                  },
                });
              } else {
                nextRun();
              }
            } else {
              nextRun();
            }
          } else {
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
              type: STATES.RESET_SELECTED_STATE,
            });

            if (Number(jsonObject.id) === auth.data.user.company_id) {
              const pricingEngineId = Number(jsonObject.pricing_engine_id);
              if (userType.includes(auth.data.user.user_type_id)) {
                if (auth.data.user.pricing_engine.id !== pricingEngineId) {
                  if (
                    !pricingEngine.pricing.loading &&
                    pricingEngine.pricing.data.length > 0
                  ) {
                    const newPricingEngine = pricingEngine.pricing.data
                      .filter((item) => item.value === pricingEngineId)
                      .reduce((_, item) => {
                        return {
                          id: item.value,
                          name: item.label,
                        };
                      }, {});
                    if (Object.keys(newPricingEngine).length > 0) {
                      dispatch({
                        type: "token",
                        payload: {
                          user: {
                            ...auth.data.user,
                            ...{
                              ...auth.data.user,
                              pricing_engine: newPricingEngine,
                            },
                          },
                          isAuthenticated: true,
                        },
                      });
                      const secret = new TextEncoder().encode(
                        process.env.SECURITY_APP
                      );
                      const token = await new jose.SignJWT({
                        userData: {
                          ...auth.data.user,
                          ...{
                            ...auth.data.user,
                            pricing_engine: newPricingEngine,
                          },
                        },
                      })
                        .setProtectedHeader({ alg: "HS256" })
                        .setIssuedAt()
                        .sign(secret);
                      onSetUplistCookies(token, true);
                    }
                  }
                }
              }
            }

            return true;
          }
        }
      } catch (error) {
        dispatch(formDialogAlert(false, false, ""));
        formChangeRemove();
        onDispatchError(dispatch, "Error", error.response.data.message);
        if (error.response) {
          if (error.response.hasOwnProperty("data")) {
            if (error.response.status === 403) {
              setTimeout(() => {
                location.reload();
              }, 1500);
              return;
            }

            if (
              error.response.data.hasOwnProperty("message") &&
              error.response.data.hasOwnProperty("errors")
            ) {
              const namesKey = [];
              const errors = error.response.data.errors;
              for (const [key, value] of Object.entries(errors)) {
                namesKey.push(key);
                andfForm.setFields([
                  {
                    name: key,
                    errors: value,
                  },
                ]);
              }
              //also scroll to the first error
              andfForm.scrollToField(namesKey[0]);

              return;
            }
          }
        }
        /**
         * HOtfix  do not redirect
         */

        // checkPath(
        //   auth.data.user.user_type_id === userTypes.COMPANY_ADMIN
        //     ? `/company/${jsonObject.id}`
        //     : "/company"
        // );
      } finally {
        controller.abort();
      }
    }
  };
};

/**
 * Get hubspot company list
 * @param {Number} limit
 * @returns {Void} void
 */
export const getHubspotCompanyListAction = (limit) => {
  return async (dispatch, getState) => {
    const { company } = getState();
    const controller = new AbortController();
    const { signal } = controller;

    try {
      dispatch({
        type: COMPANY.getHubspotCompanyList,
        payload: {
          loading: true,
          company: company.hubspot_company_list.company,
        },
      });
      const response = await getHubspotCompanyAPI(limit, signal);
      const mapped = response.data.hubspot_company_list.results
        .map((comp) => {
          return {
            ...comp,
            key: comp.id,
            label: comp.properties.name,
            value: comp.properties.name,
          };
        })
        .sort((a, b) =>
          a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
        );

      if (response.status === 200) {
        dispatch({
          type: COMPANY.getHubspotCompanyList,
          payload: {
            loading: false,
            company: mapped,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      controller.abort();
    }
  };
};

/**
 * Get Company Logo
 * @param {String} company
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const getCompanyLogoAction = (company, errorHandler) => {
  const controller = new AbortController();
  const { signal } = controller;

  return async (dispatch) => {
    dispatch({
      type: COMPANY.getCompanyLogo,
      payload: {
        link: "",
        loading: true,
      },
    });
    try {
      const response = await getCompanyLogoAPI(company, signal);
      if (response.status === 200) {
        dispatch({
          type: COMPANY.getCompanyLogo,
          payload: { ...response.data.company, loading: false },
        });
      }
      return response;
    } catch (error) {
      dispatch({
        type: COMPANY.getCompanyLogo,
        payload: {
          loading: false,
        },
      });
      errorHandler();
    } finally {
      controller.abort();
    }
  };
};

export const getCompanyByCodeAction = (code) => async (dispatch) => {
  const controller = new AbortController();
  try {
    const response = await getCompanyByCodeAPI(code, controller.signal);
    dispatch({
      type: COMPANY.getCompanyByCode,
      payload: {
        company: response.data.company,
        loading: false,
      },
    });
  } catch (error) {
    dispatch({
      type: COMPANY.getCompanyByCode,
      payload: { loading: false },
    });
    onHandleError(error, dispatch);
  } finally {
    controller.abort();
  }
};
