import React, { useEffect } from "react";
import Head from "next/head";
import AddUpdateCompany from "~/components/AddUpdateCompany/AddUpdateCompany";
import { getCompanyAction } from "~/store/company/action";
import { getStatesAction } from "~/store/state/action";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import Layout from "~/layout/Layout";
import { createElementsToDom } from "~/error/onHandleError";

function UpdateCompany() {
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
      const { pathname } = new URL(window.location.href);
      const isValidNumber = pathname.split("/").pop();
      if (isNaN(Number(isValidNumber))) {
        createElementsToDom(404);
      } else {
        dispatch(getStatesAction());
        dispatch(getPricingEngineAction());
        dispatch(getCompanyAction(isValidNumber, true));
      }
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Update Company </title>
      </Head>
      <Layout>
        <AddUpdateCompany />
      </Layout>
    </>
  );
}

export default UpdateCompany;
