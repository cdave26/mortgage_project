import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Script from "next/script";
import { startCase } from "lodash";

import { LiveInHomeRatesContext } from "~/utils/context";
import PublicLayout from "~/layout/PublicLayout";
import { getPublicListingAction } from "~/store/publicstore/action";
import { getCreditScoreRangeAction } from "~/store/creditScoreRange/action";
import { getOccupancyTypesAction } from "~/store/occupancyType/action";
import { getCompanyByCodeAction } from "~/store/company/action";
import buydown from "~/enums/buydown";

import LiveInHomeRatesComponent from "~/components/listing/LiveInHomeRatesComponent";
import companies from "~/wordpress/companies";

const LiveInHomeRates = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const { id, mlsNumber, companyName: code } = router.query;
  const hasWindow = typeof window !== "undefined";

  const { loading, myCompany } = useSelector((state) => {
    return {
      loading: hasWindow ? state.publicStore.publicListing.loading : false,
      myCompany: state.company.myCompany,
    };
  }, shallowEqual);

  useEffect(() => {
    dispatch(getCreditScoreRangeAction(true));
    dispatch(getOccupancyTypesAction(true));
    dispatch(getPublicListingAction({ id, mlsNumber }));
    dispatch(getCompanyByCodeAction(code));
  }, []);

  const [contextData, setContextData] = useState({
    showModal: false,
    isVetMilitary: false,
    isFirstTimeBuyer: false,
    loanAmount: 0,
    downPercent: 20,
    downPayment: 0,
    creditScore: { value: "780,850", label: "780 or higher" },
    occupancyType: { value: "PrimaryResidence", label: "Primary Residence" },
    sellerCredits: 0,
    loadingGetPayments: false,
    hasResults: false,
    getPaymentResults: [],
    buydown: { key: buydown.NONE, label: "None" },
  });

  const stateSetter = (value) =>
    setContextData((state) => ({ ...state, ...value }));

  if (!myCompany.loading && !myCompany.company.name) {
    location.href = "/404";
  }

  const constructCompanyCode = () => {
    if (Object.keys(myCompany?.company).length) {
      return myCompany?.company?.name;
    }

    if (!code) return "";

    return startCase(code);
  };

  return (
    <>
      <Head>
        <title>{`${constructCompanyCode()} | Live In Home Rates`}</title>
      </Head>
      <LiveInHomeRatesContext.Provider value={{ contextData, stateSetter }}>
        <PublicLayout fullwidth={true} childrenloading={loading}>
          {hasWindow && <LiveInHomeRatesComponent />}
        </PublicLayout>
      </LiveInHomeRatesContext.Provider>
    </>
  );
};

export default LiveInHomeRates;
