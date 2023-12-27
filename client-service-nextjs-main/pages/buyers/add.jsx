import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Head from "next/head";
import AddBuyer from "~/components/pre-approved-buyers/AddUpdateBuyersComponent";
import { getStatesAction } from "~/store/state/action";
import { getCreditScoreRangeAction } from "~/store/creditScoreRange/action";
import { getOccupancyTypesAction } from "~/store/occupancyType/action";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import Layout from "~/layout/Layout";
import {
  initializeBuyerDetails,
  setInProgressAction,
} from "~/store/buyer/action";
import { getNumberOfUnitsAction } from "~/store/numberOfUnits/action";

const AddBuyers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getStatesAction());
    dispatch(getPropertyTypesAction());
    dispatch(getOccupancyTypesAction());
    dispatch(getCreditScoreRangeAction());
    dispatch(getNumberOfUnitsAction());
    setInProgressAction(dispatch, false);
    initializeBuyerDetails(dispatch);
  }, []);

  return (
    <>
      <Head>
        <title> Uplist | Add Buyer </title>
      </Head>
      <Layout>
        <AddBuyer />
      </Layout>
    </>
  );
};

export default AddBuyers;
