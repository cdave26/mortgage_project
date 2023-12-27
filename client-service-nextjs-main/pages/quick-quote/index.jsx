import React, { useEffect } from "react";
import Layout from "~/layout/Layout";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { getCreditScoreRangeAction } from "~/store/creditScoreRange/action";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import { getOccupancyTypesAction } from "~/store/occupancyType/action";
import { getNumberOfUnitsAction } from "~/store/numberOfUnits/action";
import { getLicenseStatesPerUserAction } from "~/store/licenses/action";

import QuickQuoteComponent from "~/components/quick-quote/QuickQuoteComponent";

const QuickQuote = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      dispatch(getLicenseStatesPerUserAction(userData.id));
      dispatch(getPropertyTypesAction(true));
      dispatch(getCreditScoreRangeAction(true));
      dispatch(getOccupancyTypesAction(true));
      dispatch(getNumberOfUnitsAction());
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Quick Quote</title>
      </Head>
      <Layout>
        <QuickQuoteComponent />
      </Layout>
    </>
  );
};

export default QuickQuote;
