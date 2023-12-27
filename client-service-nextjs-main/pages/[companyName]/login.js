import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Head from "next/head";
import LoginComponent from "~/components/login/LoginComponent";
import Layout from "~/layout/Layout";
import { getCompanyLogoAction } from "~/store/company/action";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loadPage, setLoadPage] = useState(false);
  const companyCode = router.asPath.split("/")[1];
  const company = useSelector((state) => state.company.companyLogoDetails);

  const pageDoesNotExist = () => {
    router.push(`/${companyCode}/404`);
  };

  useEffect(() => {
    dispatch(getCompanyLogoAction(companyCode, pageDoesNotExist));
  }, []);

  useEffect(() => {
    company?.name && setLoadPage(true);
  }, [company]);

  return (
    loadPage && (
      <>
        <Head>
          <title> {company.name} | Login</title>
        </Head>
        <Layout>
          <LoginComponent companyName={company.name} />
        </Layout>
      </>
    )
  );
};

export default Login;
