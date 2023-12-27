import React, { useEffect } from "react";
import Head from "next/head";
import getConfig from "next/config";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { getStatesPerCompanyAction } from "~/store/state/action";
import { FLYERS } from "~/store/flyers/type";
import { getFlyerTemplatesAction } from "~/store/flyers/action";

import GenerateMarketingFlyers from "~/components/marketing-flyers/MarketingFlyersComponent";
import Layout from "~/layout/Layout";

const MarketingFlyers = () => {
  const {
    publicRuntimeConfig: { appTitle },
  } = getConfig();
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      dispatch(getStatesPerCompanyAction(userData.company_id));
      dispatch(
        getFlyerTemplatesAction({
          page: 1,
          limit: FLYERS.FLYER_TEMPLATE_SIZE,
          type: "marketing",
        })
      );
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> {appTitle} | Marketing Flyers </title>
      </Head>
      <Layout>
        <GenerateMarketingFlyers />
      </Layout>
    </>
  );
};

export default MarketingFlyers;
