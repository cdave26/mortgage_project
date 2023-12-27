import React from 'react';
import Head from 'next/head';
import LoginComponent from '~/components/login/LoginComponent';
import Layout from '~/layout/Layout';

const Login = () => {
  return (
    <>
      <Head>
        <title> Uplist | Login</title>
      </Head>
      <Layout>
        <LoginComponent />
      </Layout>
    </>
  );
};

export default Login;
