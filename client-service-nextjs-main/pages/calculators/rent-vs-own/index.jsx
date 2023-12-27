import React from 'react';
import RentVSOwn from '~/components/calculator/RentVSOwn';
import Head from 'next/head';
import Layout from '~/layout/Layout';

const RentVsOwn = () => {
  return (
    <>
      <Head>
        <title> Uplist | Rent VS Own Calculator</title>
      </Head>
      <Layout>
        <RentVSOwn />
      </Layout>
    </>
  );
};

export default RentVsOwn;
