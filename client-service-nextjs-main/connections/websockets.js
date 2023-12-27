/**
 * This is the connection for the websocket
 * that will be used to handle the data
 */

import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import * as jose from "jose";
import { getUserListAction } from "~/store/users/action";
import { companyListAction } from "~/store/company/action";

/**
 * websockets - This function is used to handle the websocket connection
 * @param {Object} parsedData
 * @param {Object} event
 * @param {Function} dispatch
 * @param {Object} dataStore
 * @param {String} token
 * @param {Object} router
 * @returns {void}
 */

const roles = [1, 2]; //company admin and uplist admin
const rolesCompanyAdminAndLoanOfficer = [2, 3]; //company admin and loan officer

export const websockets = (
  parsedData,
  event,
  dispatch,
  dataStore,
  token,
  router
) => {
  if (typeof event !== "object") {
    throw new Error("event must be a object");
  }

  if (typeof dispatch !== "function") {
    throw new Error("dispatch must be a function");
  }

  if (typeof parsedData !== "object") {
    throw new Error("parsedData must be a object");
  }

  if (typeof dataStore !== "object") {
    throw new Error("dataStore must be a object");
  }

  const { data } = event;

  if (typeof data !== "string") {
    throw new Error("data must be a string");
  }

  if (data === "") return;

  const recieved = JSON.parse(data);

  const { type, payload, whoisUpdating, whois, company_id } = recieved;

  if (typeof type !== "string") {
    throw new Error("type must be a string");
  }

  if (typeof payload !== "object") {
    throw new Error("payload must be a object");
  }

  const userNumRole =
    typeof parsedData.user_type_id == "string"
      ? Number(parsedData.user_type_id)
      : parsedData.user_type_id;

  const { pathname } = new URL(window.location.href);

  const modifiedCookie = async (newSetOfData) => {
    const secret = new TextEncoder().encode(process.env.SECURITY_APP);
    const token = await new jose.SignJWT({
      userData: newSetOfData,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .sign(secret);
    onSetUplistCookies(token, true);
  };

  const showNotification = (message, description) => {
    dispatch({
      type: "UI/snackbars",
      payload: {
        open: true,
        message,
        description,
        position: "topRight",
        type: "success",
      },
    });
  };

  switch (type) {
    case "user-update":
      if (payload.id === parsedData.id) {
        /**
         * Make sure that the user is in the same company
         */
        if (parsedData.company.id == payload.company.id) {
          payload.user_type_id =
            typeof payload.user_type_id === "string"
              ? Number(payload.user_type_id)
              : payload.user_type_id;
          payload.company_id =
            typeof payload.company_id === "string"
              ? Number(payload.company_id)
              : payload.company_id;

          dispatch({
            type: "token",
            payload: {
              user: {
                ...parsedData,
                ...payload,
              },
              isAuthenticated: token,
            },
          });
          dispatch({
            type: "USER_TO_UPDATE",
            payload: payload,
          });

          if (rolesCompanyAdminAndLoanOfficer.includes(userNumRole)) {
            showNotification("Received update", "Your profile was updated.");
          }

          modifiedCookie({
            ...parsedData,
            ...payload,
          });
        }
      }

      break;
    case "company-update":
      /**
       * Compnay update
       * users belongs to the company will recieve the update
       */

      if (whoisUpdating !== parsedData.id) {
        if (parsedData.company.id == payload.id) {
          showNotification("Received update", "Your company was updated.");
          modifiedCookie({
            ...parsedData,
            company: payload,
          });

          dispatch({
            type: "token",
            payload: {
              user: {
                ...parsedData,
                company: payload,
              },
              isAuthenticated: token,
            },
          });
          dispatch({
            type: "USER_TO_UPDATE",
            payload: {
              ...parsedData,
              company: payload,
            },
          });

          /**
           * If the browser in the edit page by CA/UA
           */
          if (roles.includes(userNumRole)) {
            if (
              `/company/${pathname.split("/").pop().trim()}` ===
              `/company/${payload.id}`
            ) {
              showNotification("Reload", "You have the latest data");
            }
          }
        }
      }

      break;
    case "added-user":
      /**
       * Added user
       * Uplist admin and company admin will recieve the update
       */
      if (whois !== parsedData.id) {
        if (roles.includes(userNumRole)) {
          const urlFragment = [
            "users",
            "company-admin",
            "uplist-admin",
            "loan-officer",
          ];
          /**
           * Query the user list if the user is in the user list page
           * to get the latest data
           */
          if (urlFragment.includes(pathname.split("/").pop().trim())) {
            const { users } = dataStore;
            dispatch(
              getUserListAction({
                page: users.listOfUsers.page,
                limit: users.listOfUsers.limit,
                search: users.listOfUsers.search,
                companyId: users.listOfUsers.companyId,
                priceEngineId: users.listOfUsers.priceEngineId,
                userType: users.listOfUsers.userType,
                sortBy: users.listOfUsers.sortBy,
                filteredBy: users.listOfUsers.filteredBy,
              })
            );
          }
          /**
           * Broad cast to company admin belongs to the company to show the notification
           * Make sure that the user is in the same company
           */
          if (company_id === parsedData.company.id) {
            showNotification(
              "User",
              `New <b>${payload.first_name} ${payload.last_name}</b> was added.`
            );
          }

          /**
           * Broad cast to uplist admin to show the notification
           */
          if (userNumRole === 1) {
            showNotification(
              "User",
              `New <b>${payload.first_name} ${payload.last_name}</b> was added`
            );
          }
        }
      }

      break;

    case "added-company":
      /***
       * Added company
       * only  Uplist admin will recieve the the data
       * Broadcast to all uplist admin execpt the user who added the company
       */

      if (whois !== parsedData.id) {
        if (userNumRole === 1) {
          if (pathname.split("/").pop().trim() === "company") {
            const { company } = dataStore;
            dispatch(
              companyListAction({
                name: company.list.name,
                company_nmls_number: company.list.company_nmls_number,
                state: company.list.state,
                page: company.list.page,
                limit: company.list.limit,
                sortBy: company.list.sortBy,
              })
            );
          }

          showNotification(
            "Company",
            ` New <b>${payload.name}</b> company has been added`
          );
        }
      }

      break;

    default:
      break;
  }
};
