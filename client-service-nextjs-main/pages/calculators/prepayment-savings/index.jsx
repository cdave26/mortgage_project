import React from 'react';
import PrepaymentSavings from '~/components/calculator/PrepaymentSavings';
import Head from 'next/head';
import Layout from '~/layout/Layout';

const PaymentSavings = () => {
  return (
    <>
      <Head>
        <title> Uplist | Prepayment Savings Calculator </title>
      </Head>
      <Layout>
        <PrepaymentSavings />
      </Layout>
    </>
  );
};

export default PaymentSavings;
