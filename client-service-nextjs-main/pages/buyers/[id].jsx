import React, { useEffect } from "react";
import Head from "next/head";
import UpdateBuyer from "~/components/pre-approved-buyers/AddUpdateBuyersComponent";
import { getStatesAction } from "~/store/state/action";
import { useDispatch } from "react-redux";
import { getBuyerAction, setInProgressAction } from "~/store/buyer/action";
import Layout from "~/layout/Layout";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import { getOccupancyTypesAction } from "~/store/occupancyType/action";
import { getCreditScoreRangeAction } from "~/store/creditScoreRange/action";
import { getNumberOfUnitsAction } from "~/store/numberOfUnits/action";

const UpdateBuyers = () => {
  const dispatch = useDispatch();
  const id =
    typeof window !== "undefined" && window.location.href.split("/").pop();

  useEffect(() => {
    dispatch(getBuyerAction(id));
    dispatch(getStatesAction());
    dispatch(getPropertyTypesAction());
    dispatch(getOccupancyTypesAction());
    dispatch(getCreditScoreRangeAction());
    dispatch(getNumberOfUnitsAction());
    setInProgressAction(dispatch, false);
  }, []);

  return (
    <>
      <Head>
        <title> Uplist | Update Buyer </title>
      </Head>
      <Layout>
        <UpdateBuyer id={id} />
      </Layout>
    </>
  );
};

export default UpdateBuyers;
