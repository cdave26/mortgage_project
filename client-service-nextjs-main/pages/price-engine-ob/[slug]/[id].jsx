import React, { useEffect } from 'react';
import Head from 'next/head';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { getCompanyStrategyAction } from '~/store/pricingEngine/optimalBlue/action';
import Layout from '~/layout/Layout';
import EditUserStrategyComponent from '~/components/optimal-blue/EditUserStrategyComponent';

const EditUserStrategy = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      dispatch(
        getCompanyStrategyAction(
          router.query.slug === 'edit' ? router.query.id : null
        )
      );
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Edit User Strategy </title>
      </Head>
      <Layout>
        <EditUserStrategyComponent />
      </Layout>
    </>
  );
};

export default EditUserStrategy;
