import React, { useEffect } from 'react';
import Head from 'next/head';
import PublicLayout from '~/layout/PublicLayout';
import BuyerSuccess from '~/components/buyer/SuccessComponent';
import { useDispatch } from 'react-redux';
import { setUIRenderAction } from '~/store/ui/action';

const HomePricePage = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setUIRenderAction(false));
  }, []);
  return (
    <>
      <Head>
        <title>Uplist | Success</title>
      </Head>
      <PublicLayout>
        <BuyerSuccess />
      </PublicLayout>
    </>
  );
};

export default HomePricePage;
