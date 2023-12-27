import dayjs from "dayjs";

import { onHandleError } from "~/error/onHandleError";

import {
  getUserLicenseListAPI,
  createUserLicenseAPI,
  getLicenseByIdAPI,
  updateLicenseAPI,
  deleteLicenseAPI,
  getLicensePerStateAPI,
  getLicenseStatesPerUserAPI,
} from "./api";
import { LICENSES } from "./type";
import store from "~/store/store";

export const getLicensesByUser = async (
  user,
  page,
  limit,
  search,
  stateId,
  sortBy,
  order
) => {
  const controller = new AbortController();

  const {
    licenses: { listOfLicenses },
  } = store.getState();

  try {
    store.dispatch({
      type: LICENSES.listOfLicenses,
      payload: {
        loading: true,
        list:
          Object.keys(listOfLicenses.list).length > 0
            ? listOfLicenses.list
            : {},
        page,
        limit,
        search,
        stateId,
        sortBy,
        order,
      },
    });

    const response = await getUserLicenseListAPI(
      user,
      page,
      limit,
      controller.signal,
      search,
      stateId,
      sortBy,
      order
    );

    if (response.status === 200) {
      const newData = {
        ...response.data.licenses,
        data:
          response.data.licenses.data.length > 0
            ? response.data.licenses.data.map((item) => {
                return {
                  ...item,
                  key: item.id,
                  state: `${item.abbreviation} - ${item.state_name}`,
                  updated_at: dayjs(item.updated_at).format(
                    "MMM DD, YYYY hh:mmA"
                  ),
                  created_at: dayjs(item.created_at).format(
                    "MMM DD, YYYY hh:mmA"
                  ),
                };
              })
            : response.data.licenses.data,
      };

      store.dispatch({
        type: LICENSES.listOfLicenses,
        payload: {
          loading: false,
          list: newData,
          page: newData.current_page,
          limit: newData.per_page,
          search,
          stateId,
          sortBy,
          order,
        },
      });
    }
  } catch (error) {
    onHandleError(error, store.dispatch);

    store.dispatch({
      type: LICENSES.listOfLicenses,
      payload: {
        loading: false,
        list: {},
        page: 1,
        limit: 10,
        search,
        stateId,
        sortBy,
        order,
      },
    });
  } finally {
    controller.abort();
  }
};

export const resetUserLicenseStateAction = (dispatch) => {
  dispatch({
    type: LICENSES.licenseStatesPerUser,
    payload: {
      loading: false,
      data: [],
    },
  });
};

/**
 * Get license list for each user
 * @param {Object} query
 * @returns {void}
 */
export const getLicenseListAction = ({
  page,
  limit,
  search,
  stateId,
  sortBy,
  order,
}) => {
  return async () => {
    const {
      auth: { data },
    } = store.getState();

    if (data.user) {
      getLicensesByUser(
        data.user.id,
        page,
        limit,
        search,
        stateId,
        sortBy,
        order
      );
    } else {
      throw new Error("Auth user not found");
    }
  };
};

/**
 * Create license Action
 * @param {Object} user
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const createUserLicenseAction = (body, signal) => {
  return async (dispatch, getState) => {
    const {
      auth: { data },
    } = getState();

    if (data.user) {
      dispatch({
        type: LICENSES.onProgress,
        payload: true,
      });
      return await createUserLicenseAPI(body, signal);
    } else {
      throw new Error("Auth user not found");
    }
  };
};

/**
 * Is edit license
 * @param {Boolean} isEdit
 * @returns {void}
 */
export const isEditLicenseAction = (isEdit) => {
  return (dispatch) => {
    dispatch({
      type: LICENSES.isEdit,
      payload: isEdit,
    });
  };
};

/**
 * License that is selected
 * @param {Object} license
 * @returns {void}
 */
export const selectedLicenseAction = (license) => {
  return (dispatch) => {
    dispatch({
      type: LICENSES.selectedLicense,
      payload: license,
    });
  };
};

/**
 * Get license
 * @param {Number} id
 * @returns {void}
 */
export const getLicenseAction = (id) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await getLicenseByIdAPI(Number(id), signal);

      if (response.status === 200) {
        const {
          id: licenseId,
          state_name,
          abbreviation,
          updated_at,
        } = response.data.license;

        const constructed = {
          ...response.data.license,
          key: licenseId,
          state: `${abbreviation} - ${state_name}`,
          updated_at: dayjs(updated_at).format("MMM DD, YYYY hh:mmA"),
        };

        dispatch({
          type: LICENSES.listOfLicenses,
          payload: {
            list: { data: [constructed] },
          },
        });

        dispatch(selectedLicenseAction(constructed));
      }
    } catch (error) {
      onHandleError(error, dispatch, null, "/my-state-licenses");
    } finally {
      controller.abort();
    }
  };
};

/**
 * Update license details
 * @param {Object} license
 * @returns {void}
 */
export const updateLicenseAction = (id, license, signal) => {
  return async (dispatch, getState) => {
    const {
      auth: { data },
    } = getState();

    if (data.user) {
      dispatch({
        type: LICENSES.onProgress,
        payload: true,
      });

      return await updateLicenseAPI(Number(id), license, signal);
    } else {
      throw new Error("Auth user not found");
    }
  };
};

/**
 * Delete license
 * @param {Object} id
 * @returns {Promise<AxiosResponse<T>>}
 */
export const deleteLicenseAction = (id) => {
  return async (dispatch, _) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await deleteLicenseAPI(Number(id), signal);

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
          type: LICENSES.deleteLicense,
          payload: id,
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

/**
 * ON SEARCH TYPING
 * @param {String} search
 * @returns {void}
 */
export const onSearchLicenseTypingAction = (search) => {
  return (dispatch) => {
    dispatch({
      type: LICENSES.onSearchTyping,
      payload: search,
    });
  };
};

/**
 * Get user license per state
 * @param {Number} stateId
 * @param {Number} userId
 * @returns {void}
 */
export const getLicensesPerStateAction = (stateId, userId) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      dispatch({
        type: LICENSES.licensesPerState,
        payload: {
          loading: true,
          data: [],
        },
      });

      const response = await getLicensePerStateAPI(stateId, userId, signal);
      if (response.status === 200) {
        const transformed = response.data.licenses.map((item) => {
          return {
            key: item.id,
            value: item.license,
            label: item.license,
            disabled: false,
          };
        });

        dispatch({
          type: LICENSES.licensesPerState,
          payload: {
            loading: false,
            data: transformed,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: LICENSES.licensesPerState,
        payload: {
          loading: false,
          data: [],
        },
      });
    }
  };
};

/**
 * Get license states for each user
 * @param {Number} userId
 * @param {String} selectedLabel
 * @returns {void}
 */
export const getLicenseStatesPerUserAction = (
  userId,
  selectedLabel = "full_name"
) => {
  return async (dispatch) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      dispatch({
        type: LICENSES.licenseStatesPerUser,
        payload: {
          loading: true,
          data: [],
        },
      });

      const response = await getLicenseStatesPerUserAPI(
        userId,
        selectedLabel,
        signal
      );

      if (response.status === 200) {
        const transformed = response.data.licenseStates.map((item) => {
          return {
            key: item.id,
            value: item[selectedLabel],
            label: item[selectedLabel],
            state_id: item.state_id,
            license: item.license,
            disabled: false,
          };
        });

        dispatch({
          type: LICENSES.licenseStatesPerUser,
          payload: {
            loading: false,
            data: transformed,
          },
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      dispatch({
        type: LICENSES.licenseStatesPerUser,
        payload: {
          loading: false,
          data: [],
        },
      });
    }
  };
};
