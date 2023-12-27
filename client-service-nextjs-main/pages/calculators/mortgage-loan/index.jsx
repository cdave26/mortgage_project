import React from "react";
import Head from "next/head";
import LoanPaymentAmortization from "~/components/calculator/LoanPaymentAmortization";

import Layout from "~/layout/Layout";
const MortgageLoan = () => {
  return (
    <>
      <Head>
        <title> Uplist | Mortgage Loan Calculator </title>
      </Head>
      <Layout>
        <LoanPaymentAmortization />
      </Layout>
    </>
  );
};

export default MortgageLoan;
