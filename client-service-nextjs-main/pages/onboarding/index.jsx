import React, { useEffect } from "react";
import Head from "next/head";
import Layout from "~/layout/Layout";
import OnboardingComponent from "~/components/onboarding/Onboarding";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

const Onboarding = () => {
  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  return (
    <div>
      <Head>
        <title> Uplist | Onboarding </title>
      </Head>
      <Layout>{userData && <OnboardingComponent user={userData} />}</Layout>
    </div>
  );
};

export default Onboarding;
