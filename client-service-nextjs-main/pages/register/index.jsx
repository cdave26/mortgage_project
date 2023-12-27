import React, { useEffect } from 'react';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import RegisterComponent from '~/components/register/RegisterComponent';
import { getPricingEngineAction } from '~/store/pricingEngine/action';
import Layout from '~/layout/Layout';
const Register = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPricingEngineAction());
  }, []);

  return (
    <>
      <Head>
        <title> Uplist | Register</title>
      </Head>
      <Layout>
        <RegisterComponent />
      </Layout>
    </>
  );
};

export default Register;
