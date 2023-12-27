import React from 'react';
import Head from 'next/head';

import PricingCard from '~/components/pricing-card/PricingCard';
import Layout from '~/layout/Layout';
const PricingPage = () => {
  return (
    <>
      <Head>
        <title>Uplist | Pricing</title>
      </Head>
      <Layout>
        <PricingCard />
      </Layout>
    </>
  );
};

export default PricingPage;
