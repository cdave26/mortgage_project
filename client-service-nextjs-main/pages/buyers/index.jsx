import React, { useEffect } from "react";
import Head from "next/head";
import { useDispatch } from "react-redux";
import BuyersList from "~/components/pre-approved-buyers/BuyersListComponent";
import { getStatesAction } from "~/store/state/action";
// import { getBuyersListAction } from "~/store/buyer/action";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import Layout from "~/layout/Layout";
import { setInProgressAction as loanOfficerInProgressAction } from "~/store/loanOfficer/action";

const preApprovedBuyers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(getBuyersListAction());
    dispatch(getStatesAction());
    dispatch(getPropertyTypesAction());
    loanOfficerInProgressAction(dispatch, true);
  }, []);

  return (
    <>
      <Head>
        <title> Uplist | Buyers </title>
      </Head>
      <Layout>
        <BuyersList />
      </Layout>
    </>
  );
};

export default preApprovedBuyers;
