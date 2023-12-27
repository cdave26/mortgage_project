import React, { useEffect } from "react";
import Head from "next/head";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { getCompanyAction } from "~/store/company/action";
import CompanyDetails from "~/components/companyDetails/CompanyDetails";
import { getStatesAction } from "~/store/state/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import Layout from "~/layout/Layout";
import AddUpdateCompany from "~/components/AddUpdateCompany/AddUpdateCompany";
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
        dispatch(getCompanyAction(pathname.split("/").pop(), true));
      }
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Company Details </title>
      </Head>
      <Layout>
        <AddUpdateCompany viewDetails={true} />
        {/* <CompanyDetails /> */}
      </Layout>
    </>
  );
}

export default UpdateCompany;
