import React from 'react';
import AnnualPercentageRateCalculator from '~/components/calculator/AnnualPercentageRateCalculator';
import Head from 'next/head';
import Layout from '~/layout/Layout';

const AnnualPercentageRate = () => {
  return (
    <>
      <Head>
        <title> Uplist | Annual Percentage Rate Calculator </title>
      </Head>
      <Layout>
        <AnnualPercentageRateCalculator />
      </Layout>
    </>
  );
};

export default AnnualPercentageRate;
