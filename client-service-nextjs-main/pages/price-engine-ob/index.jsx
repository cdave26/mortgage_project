import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  getCompanyStrategyAction,
  getDefaultStrategyPerCompanyAction,
  resetCompanyStrategy,
  resetDefaultStrategy,
  selectMassUsersAction,
  selectedCompanyAction,
  showMassUpdateModalAction,
} from "~/store/pricingEngine/optimalBlue/action";
import { getUserTypesAction } from "~/store/auth/action";
import userTypes from "~/enums/userTypes";
import { getCompanyListByIdAction } from "~/store/company/action";

import Layout from "~/layout/Layout";
import StrategiesComponent from "~/components/optimal-blue/StrategiesComponent";

const OptimalBlue = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      // reset states to avoid data re-rendering
      dispatch(showMassUpdateModalAction(false));
      dispatch(selectMassUsersAction([]));

      dispatch(getUserTypesAction(true));

      if (userData?.user_type_id === userTypes.UPLIST_ADMIN) {
        // reset states to avoid data re-rendering
        dispatch(selectedCompanyAction(null));
        dispatch(resetCompanyStrategy());
        dispatch(resetDefaultStrategy());

        dispatch(getCompanyListByIdAction());
      }

      if (userData.user_type_id === userTypes.COMPANY_ADMIN) {
        dispatch(getDefaultStrategyPerCompanyAction());
        dispatch(getCompanyStrategyAction());
      }
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Optimal Blue Price Engine Management </title>
      </Head>
      <Layout>
        <StrategiesComponent />
      </Layout>
    </>
  );
};

export default OptimalBlue;
