/**
 * Copyright (R) 2023, Lanex Corporation
 * Handles the redux store and middleware of the application
 *
 * @project Uplist
 * @since: March 14, 2023
 * @created_time 08:30:30 AM
 * @author: Elmer Alluad Jr.
 */

import {
  applyMiddleware,
  compose,
  legacy_createStore as createStore,
  combineReducers,
} from "redux";
import thunk from "redux-thunk";
import logger from "redux-logger";
import { composeWithDevTools } from "redux-devtools-extension";
import auth from "./auth/reducer";
import ui from "./ui/reducer";
import pricingEngine from "./pricingEngine/reducer";
import users from "./users/reducer";
import company from "./company/reducer";
import licenseStates from "./state/reducer";
import licenses from "./licenses/reducer";
import listings from "./listing/reducer";
import counties from "./county/reducer";
import optimalBlue from "./pricingEngine/optimalBlue/reducer";
import publicStore from "./publicstore/reducer";
import buyer from "./buyer/reducer";
import propertyType from "./propertyType/reducer";
import occupancyType from "./occupancyType/reducer";
import creditScoreRange from "./creditScoreRange/reducer";
import numberOfUnits from "./numberOfUnits/reducer";
import buyersPreApproval from "./buyersPreApproval/reducer";
import loanOfficer from "./loanOfficer/reducer";
import flyers from "./flyers/reducer";
import listingStatus from "./listingStatus/reducer";
import device from "~/store/device/reducer";

const publicRoutObject = ["listing"];
const specificPubSecondPath = ["quick-quote", "agent-listing"]; // specified to avoid conflict with the authenticated quick quote page

function mount() {
  if (typeof window !== "undefined") {
    const { pathname } = new URL(window.location.href);
    const conditionalRoutePath =
      pathname.split("/")[2] ?? pathname.split("/")[1];

    //specified to avoid conflict with the authenticated pages
    const secondRoutePath = pathname.split("/")[2];
    const isPubSecondPath = specificPubSecondPath.includes(
      secondRoutePath?.trim()
    );

    if (
      publicRoutObject.includes(conditionalRoutePath?.trim()) ||
      isPubSecondPath
    ) {
      //add public object
      return {
        ui,
        publicStore,
        occupancyType,
        creditScoreRange,
        company,
        numberOfUnits,
        counties,
        licenses,
        licenseStates,
        propertyType,
      };
    }
  }
  return {
    auth,
    ui,
    pricingEngine,
    users,
    company,
    licenseStates,
    licenses,
    listings,
    counties,
    optimalBlue,
    buyer,
    propertyType,
    occupancyType,
    creditScoreRange,
    numberOfUnits,
    buyersPreApproval,
    loanOfficer,
    flyers,
    listingStatus,
    device,
  };
}

const middleware = compose(
  process.env.NODE_ENV === "development"
    ? applyMiddleware(thunk, logger)
    : applyMiddleware(thunk)
);

export default createStore(
  combineReducers(mount()),
  process.env.NODE_ENV === "development"
    ? composeWithDevTools(middleware)
    : middleware
);
