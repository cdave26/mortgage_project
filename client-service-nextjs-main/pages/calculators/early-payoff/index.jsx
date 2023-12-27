import React from 'react';
import Head from 'next/head';
import EarlyPayoff from '~/components/calculator/EarlyPayoff';
import Layout from '~/layout/Layout';

const EarlyPayOff = () => {
  return (
    <>
      <Head>
        <title> Uplist | Early Payoff Calculator </title>
      </Head>
      <Layout>
        <EarlyPayoff />
      </Layout>
    </>
  );
};

export default EarlyPayOff;
