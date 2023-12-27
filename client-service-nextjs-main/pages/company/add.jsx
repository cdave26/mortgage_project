import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import AddUpdateCompany from "~/components/AddUpdateCompany/AddUpdateCompany";
import { getStatesAction } from "~/store/state/action";
import { getHubspotCompanyListAction } from "~/store/company/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import Layout from "~/layout/Layout";

const AddCompany = () => {
  const dispatch = useDispatch();
  const { state } = useSelector((state) => {
    return {
      state: state.licenseStates.states.data,
    };
  }, shallowEqual);

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      if (state.length === 0) {
        dispatch(getStatesAction());
      }
      dispatch(getHubspotCompanyListAction(100));
      dispatch(getPricingEngineAction());
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Add Company </title>
      </Head>
      <Layout>
        <AddUpdateCompany />
      </Layout>
    </>
  );
};

export default AddCompany;
