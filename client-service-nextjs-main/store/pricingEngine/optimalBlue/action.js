import { onHandleError } from "~/error/onHandleError";
import {
  getCompanyStrategyAPI,
  getDefaultStrategyAPI,
  getLatestStrategiesAPI,
  getUserStrategyByIdAPI,
  getUsersStrategyAPI,
  massUpsertUserStrategyAPI,
  upsertDefaultStrategyAPI,
  upsertUserStrategyAPI,
} from "./api";
import { OPTIMAL_BLUE } from "./type";
import { defaultPagination, userTypeConstants } from "~/utils/constants";
import userTypes from "~/enums/userTypes";

/**
 * Construct originator data
 * @param {Array} businessChannels
 * @returns {Array}
 */
const constructOriginatorData = (businessChannels) => {
  return businessChannels
    .filter((biz) => biz.originators.length)
    .map((biz) => {
      return biz.originators.map((originator) => {
        const { index, firstName, lastName, email, userName, phoneNumber } =
          originator;
        return {
          key: index,
          value: index,
          label: `${firstName} ${lastName} (${index})`,
          email: email ?? "",
          user_name: userName,
          phone_number: phoneNumber ?? "",
          business_channel_id: biz.index,
        };
      });
    });
};

/**
 * Construct business channel data for options
 * @param {Array} businessChannels
 * @returns {Array}
 */
const constructBusinessChannels = (businessChannels) => {
  return businessChannels
    .filter((biz) => biz.originators.length)
    .map((biz) => {
      const { index, name, originators } = biz;
      return {
        key: index,
        value: index,
        label: `${name} (${index})`,
        originators: originators.map((originator) => {
          const { index, firstName, lastName, email, userName, phoneNumber } =
            originator;
          return {
            key: index,
            value: index,
            label: `${firstName} ${lastName} (${index})`,
            email: email ?? "",
            user_name: userName,
            phone_number: phoneNumber,
            business_channel_id: index,
          };
        }),
      };
    });
};

/**
 * Construct users data for table
 * @param {Array} userStrategy
 * @param {Array} businessChannels
 * @param {Array} originators
 * @returns {Array}
 */
const constructUsersStrategy = (
  userStrategy,
  businessChannels,
  originators
) => {
  return userStrategy.map((user, idx) => {
    const {
      first_name,
      last_name,
      email,
      id: userId,
      company_id: companyId,
      user_type: { name: userTypeName },
      optimal_blue_strategy: optimalBlueStrategy,
    } = user;

    let returnData = {
      key: userId,
      name: `${first_name} ${last_name}`,
      role: userTypeConstants[userTypeName],
      email,
      userId,
      companyId,
      optimalBlueStrategy,
    };

    if (optimalBlueStrategy) {
      const selectedBusinessChannel = businessChannels.filter(
        (biz) => biz.key === optimalBlueStrategy.business_channel_id
      );
      const selectedOriginator = originators
        .flat()
        .filter(
          (originator) => originator.key === optimalBlueStrategy.originator_id
        );

      returnData.business_channel = selectedBusinessChannel[0]?.label;
      returnData.originator = selectedOriginator[0]?.label;
      returnData.price = optimalBlueStrategy.price;
    }

    return returnData;
  });
};

export const resetDefaultStrategy = () => {
  return (dispatch) => {
    dispatch({
      type: OPTIMAL_BLUE.companyDefaultStrategy,
      payload: {
        data: {},
        loading: false,
      },
    });
  };
};

export const resetCompanyStrategy = (specific = {}) => {
  return (dispatch) => {
    let payload = {
      loading: false,
      company_account_id: null,
      list: [],
      options: [],
      originator_list: [],
      page: 1,
      limit: defaultPagination.pageSize,
      search: "",
      searchUserType: "",
      sortBy: "name",
      order: "desc",
      total: 0,
    };
    if (Object.keys(specific).length) {
      payload = {
        ...payload,
        ...specific,
      };
    }
    dispatch({
      type: OPTIMAL_BLUE.companyStrategy,
      payload,
    });
  };
};

export const selectedCompanyAction = (companyId) => {
  return (dispatch) => {
    dispatch({
      type: OPTIMAL_BLUE.companyId,
      payload: companyId,
    });
  };
};

/**
 * Construct strategy per company
 * @param {Number} userStrategy
 * @returns {void}
 */
export const getCompanyStrategyAction = (editId = null) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;

    const {
      optimalBlue: { companyStrategy, companyId },
      auth,
    } = getState();

    if (auth?.data?.user) {
      try {
        dispatch({
          type: OPTIMAL_BLUE.companyLatestStrategy,
          payload: {
            loading: companyStrategy.list,
            company_account_id: companyStrategy.company_account_id,
            options: companyStrategy.options,
            originator_list: companyStrategy.originators,
          },
        });

        const isUplistAdmin =
          auth.data.user.user_type_id === userTypes.UPLIST_ADMIN;

        const selectedCompanyId = isUplistAdmin
          ? companyId
          : auth.data.user.company_id;

        const response = await getCompanyStrategyAPI(signal, selectedCompanyId);

        if (response.status === 200) {
          const {
            strategies: { strategies_metadata },
          } = response.data;

          const strategies = JSON.parse(strategies_metadata);

          const businessChannels = constructBusinessChannels(
            strategies.businessChannels
          );

          const originators = constructOriginatorData(
            strategies.businessChannels
          );

          dispatch({
            type: OPTIMAL_BLUE.companyLatestStrategy,
            payload: {
              loading: false,
              company_account_id: strategies.index,
              originator_list: originators,
              options: businessChannels,
            },
          });

          if (editId) {
            dispatch(getOBUserStrategyAction(editId));
          } else {
            dispatch(
              getOBUserStrategiesAction({
                page: 1,
                limit: companyStrategy.limit ?? defaultPagination.pageSize,
                search: companyStrategy.search,
                searchUserType: companyStrategy.searchUserType,
                sortBy: "name",
                order: "desc",
              })
            );
          }
        }
      } catch (error) {
        onHandleError(error, dispatch);
        dispatch(resetCompanyStrategy());
      } finally {
        controller.abort();
      }
    } else {
      throw new Error("User not found");
    }
  };
};

/**
 * Get Optimal Blue strategies per company
 * @param {Number} page
 * @param {Number} limit
 * @param {String} search
 * @param {String} sortBy
 * @param {String} order
 * @returns {void}
 */
export const getOBUserStrategiesAction = ({
  page,
  limit,
  search,
  searchUserType,
  sortBy,
  order,
}) => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;

    const {
      optimalBlue: { companyStrategy, companyId },
      auth,
    } = getState();

    if (auth?.data?.user) {
      try {
        dispatch({
          type: OPTIMAL_BLUE.companyStrategy,
          payload: {
            loading: true,
            company_account_id: companyStrategy.company_account_id,
            originator_list: companyStrategy.originator_list,
            list: companyStrategy.list,
            options: companyStrategy.options,
            page,
            limit,
            search,
            searchUserType,
            sortBy,
            order,
            total: companyStrategy.total,
          },
        });

        const isUplistAdmin =
          auth.data.user.user_type_id === userTypes.UPLIST_ADMIN;

        const selectedCompanyId = isUplistAdmin
          ? companyId
          : auth.data.user.company_id;

        const response = await getUsersStrategyAPI(
          page,
          limit,
          search,
          searchUserType,
          sortBy,
          order,
          signal,
          selectedCompanyId
        );

        if (response.status === 200) {
          const {
            users_strategy: { data, per_page, current_page, total },
          } = response.data;

          const list = constructUsersStrategy(
            data,
            companyStrategy.options,
            companyStrategy.originator_list
          );

          dispatch({
            type: OPTIMAL_BLUE.companyStrategy,
            payload: {
              loading: false,
              company_account_id: companyStrategy.company_account_id,
              list,
              originator_list: companyStrategy.originator_list,
              options: companyStrategy.options,
              page: current_page,
              limit: per_page,
              search,
              searchUserType,
              sortBy,
              order,
              total,
            },
          });
        }
      } catch (error) {
        onHandleError(error, dispatch);
        dispatch(resetCompanyStrategy());
      } finally {
        controller.abort();
      }
    } else {
      throw new Error("User not found");
    }
  };
};

/**
 * Get strategy per user
 * @param {Number} id
 * @returns {void}
 */
export const getOBUserStrategyAction = (id) => {
  return async (dispatch, _) => {
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await getUserStrategyByIdAPI(Number(id), signal);

      if (response.status === 200) {
        dispatch(selectUserStrategyAction(response.data.strategy));
      }
    } catch (error) {
      onHandleError(error, dispatch);
      window.location.href = "/price-engine-ob";
    } finally {
      controller.abort();
    }
  };
};

/**
 * Get Optimal Blue strategies on clicking "Get Latest Strategies" button
 * @returns {void}
 */
export const getOBLatestStrategiesAction = () => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;

    const {
      optimalBlue: { companyStrategy, companyId },
      auth,
    } = getState();

    if (auth?.data?.user) {
      try {
        dispatch({
          type: OPTIMAL_BLUE.companyLatestStrategy,
          payload: {
            loading: companyStrategy.list,
            company_account_id: companyStrategy.company_account_id,
            options: companyStrategy.options,
            originator_list: companyStrategy.originator_list,
          },
        });

        const isUplistAdmin =
          auth.data.user.user_type_id === userTypes.UPLIST_ADMIN;

        const selectedCompanyId = isUplistAdmin
          ? companyId
          : auth.data.user.company_id;

        const response = await getLatestStrategiesAPI(
          selectedCompanyId,
          signal
        );

        if (response.status === 200) {
          const {
            strategies: { businessChannels, index },
            message,
          } = response.data;

          const options = constructBusinessChannels(businessChannels);
          const originators = constructOriginatorData(businessChannels);

          dispatch({
            type: OPTIMAL_BLUE.companyLatestStrategy,
            payload: {
              loading: false,
              company_account_id: index,
              originator_list: originators,
              options,
            },
          });

          dispatch(
            getOBUserStrategiesAction({
              page: 1,
              limit: defaultPagination.pageSize,
              search: "",
              searchUserType: "",
              sortBy: "name",
              order: "desc",
            })
          );

          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message,
              description: "",
              position: "topRight",
              type: "success",
            },
          });
        }
      } catch (error) {
        onHandleError(error, dispatch);
        dispatch(resetCompanyStrategy());
      } finally {
        controller.abort();
      }
    } else {
      throw new Error("User not found");
    }
  };
};

/**
 * ON FILTERING ORIGINATOR
 * @param {String} search
 * @returns {void}
 */
export const onSearchOBValuesAction = (search) => {
  return (dispatch) => {
    dispatch({
      type: OPTIMAL_BLUE.onSearchStrategy,
      payload: search,
    });
  };
};

/**
 * Get defualt strategy per company
 * @returns {void}
 */
export const getDefaultStrategyPerCompanyAction = () => {
  return async (dispatch, getState) => {
    const controller = new AbortController();
    const { signal } = controller;

    const {
      optimalBlue: { companyDefaultStrategy, companyId },
      auth,
    } = getState();

    if (auth?.data?.user) {
      try {
        dispatch({
          type: OPTIMAL_BLUE.companyDefaultStrategy,
          payload: {
            loading: true,
            data: Object.keys(companyDefaultStrategy.data).length
              ? companyDefaultStrategy.data
              : {},
          },
        });

        const isUplistAdmin =
          auth.data.user.user_type_id === userTypes.UPLIST_ADMIN;

        const selectedCompanyId = isUplistAdmin
          ? companyId
          : auth.data.user.company_id;

        const response = await getDefaultStrategyAPI(signal, selectedCompanyId);

        if (response.status === 200) {
          dispatch({
            type: OPTIMAL_BLUE.companyDefaultStrategy,
            payload: {
              loading: false,
              data: response.data.default_strategy,
            },
          });
        }
      } catch (error) {
        onHandleError(error, dispatch);
        dispatch({
          type: OPTIMAL_BLUE.companyDefaultStrategy,
          payload: {
            loading: false,
            data: {},
          },
        });
      } finally {
        controller.abort();
      }
    } else {
      throw new Error("User not found");
    }
  };
};

/**
 * Create or update default strategy action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const upsertDefaultStrategyAction = async (body, signal) => {
  return await upsertDefaultStrategyAPI(body, signal);
};

/**
 * User strategy that is selected
 * @param {Object} strategy
 * @returns {void}
 */
export const selectUserStrategyAction = (strategy, mode, id) => {
  return (dispatch) => {
    dispatch({
      type: OPTIMAL_BLUE.selectedUserStrategy,
      payload: {
        strategy,
        mode,
        id,
      },
    });
  };
};

/**
 * Create or update a user strategy action
 * @param {Number} id
 * @param {String} type
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const upsertUserStrategyAction = async (id, type, body, signal) => {
  return await upsertUserStrategyAPI(Number(id), type, body, signal);
};

/**
 * Select multiple users for mass create/update
 * @param {Boolean} show
 * @returns {void}
 */
export const selectMassUsersAction = (user) => {
  return (dispatch) => {
    dispatch({
      type: OPTIMAL_BLUE.massSelectedUserStrategy,
      payload: user,
    });
  };
};

/**
 * Display mass modal form modal
 * @param {Boolean} show
 * @returns {void}
 */
export const showMassUpdateModalAction = (show, mode) => {
  return (dispatch) => {
    dispatch({
      type: OPTIMAL_BLUE.massUpdateModal,
      payload: {
        showModal: show,
        mode,
      },
    });
  };
};

/**
 * MASS Create or update a user strategy action
 * @param {Object} body
 * @param {AbortSignal} signal
 * @returns {Promise<AxiosResponse<T>>}
 */
export const massUpsertUserStrategyAction = async (body, signal) => {
  return await massUpsertUserStrategyAPI(body, signal);
};
