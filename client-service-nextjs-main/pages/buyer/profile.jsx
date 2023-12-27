import React, { useEffect, useState } from "react";
import Head from "next/head";
import PublicLayout from "~/layout/PublicLayout";
import { getStatesAction } from "~/store/state/action";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import { getOccupancyTypesAction } from "~/store/occupancyType/action";
import { getCreditScoreRangeAction } from "~/store/creditScoreRange/action";
import { getBuyerAction, setInProgressAction } from "~/store/buyer/action";
import { useDispatch } from "react-redux";
import BuyerProfile from "~/components/buyer/BuyerProfileComponent";
import { getNumberOfUnitsAction } from "~/store/numberOfUnits/action";
import * as jose from "jose";
import { setUIRenderAction } from "~/store/ui/action";
import { setPreApprovalInProgressAction } from "~/store/buyersPreApproval/action";
import { HomePriceContext } from "~/utils/context";

const BuyerProfilePage = () => {
  const dispatch = useDispatch();
  const token =
    typeof window !== "undefined" && window.localStorage.getItem("user");
  const decodedData = token && jose.decodeJwt(token);
  const userId = decodedData?.userData?.buyer_id;

  useEffect(() => {
    try {
      Object.keys(decodedData).length && dispatch(getBuyerAction(userId));
    } catch (error) {
      dispatch({
        type: "UI/snackbars",
        payload: {
          open: true,
          message: error,
          description: "",
          position: "topRight",
          type: "error",
        },
      });
    }
    dispatch(getStatesAction());
    dispatch(getPropertyTypesAction());
    dispatch(getOccupancyTypesAction());
    dispatch(getCreditScoreRangeAction());
    dispatch(getNumberOfUnitsAction());
    dispatch(setUIRenderAction(false));
    setInProgressAction(dispatch, false);
    setPreApprovalInProgressAction(dispatch, false);
  }, []);

  const [contextData, setContextData] = useState({
    buyerData: {},
  });

  const stateSetter = (value) =>
    setContextData((state) => ({ ...state, ...value }));

  return (
    <>
      <Head>
        <title>Uplist | Buyer Profile</title>
      </Head>
      <HomePriceContext.Provider value={{ contextData, stateSetter }}>
        <PublicLayout>
          <BuyerProfile id={userId} />
        </PublicLayout>
      </HomePriceContext.Provider>
    </>
  );
};

export default BuyerProfilePage;
