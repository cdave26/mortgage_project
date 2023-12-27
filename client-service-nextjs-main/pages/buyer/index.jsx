import React, { useEffect, useState } from "react";
import Head from "next/head";
import PublicLayout from "~/layout/PublicLayout";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import { useDispatch } from "react-redux";
import { getOccupancyTypesAction } from "~/store/occupancyType/action";
import { getCreditScoreRangeAction } from "~/store/creditScoreRange/action";
import { setPreApprovalInProgressAction } from "~/store/buyersPreApproval/action";
import HomePrice from "~/components/buyer/HomePriceComponent";
import { getStatesAction } from "~/store/state/action";
import * as jose from "jose";
import { getBuyerAction } from "~/store/buyer/action";
import { setSpinningAction, setUIRenderAction } from "~/store/ui/action";
import { HomePriceContext } from "~/utils/context";

const HomePricePage = () => {
  const dispatch = useDispatch();
  const token =
    typeof window !== "undefined" && window.localStorage.getItem("user");
  const decodedData = token && jose.decodeJwt(token);
  const buyerId = decodedData?.userData?.buyer_id;

  useEffect(() => {
    try {
      Object.keys(decodedData).length && dispatch(getBuyerAction(buyerId));
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
    dispatch(getPropertyTypesAction(true));
    dispatch(getOccupancyTypesAction(true));
    dispatch(getCreditScoreRangeAction(true));
    setPreApprovalInProgressAction(dispatch, false);
    dispatch(setUIRenderAction(false));
    dispatch(setSpinningAction(true));
  }, []);

  const [contextData, setContextData] = useState({
    buyerData: {},
  });

  const stateSetter = (value) =>
    setContextData((state) => ({ ...state, ...value }));

  return (
    <>
      <Head>
        <title>Uplist | Buyer Home Price</title>
      </Head>
      <HomePriceContext.Provider value={{ contextData, stateSetter }}>
        <PublicLayout fullwidth>
          <HomePrice />
        </PublicLayout>
      </HomePriceContext.Provider>
    </>
  );
};

export default HomePricePage;
