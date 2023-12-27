import React, { useEffect } from 'react';
import Head from 'next/head';

import BuyerRegisterComponent from '~/components/buyer/BuyerRegisterComponent';
import PublicLayout from '~/layout/PublicLayout';
import { setInProgressAction } from '~/store/buyer/action';
import { useDispatch } from 'react-redux';
import { setUIRenderAction } from '~/store/ui/action';
import { useRouter } from 'next/router'
import { getCompanyLogoAction } from '~/store/company/action'

const BuyerRegisterPage = () => {
  const dispatch = useDispatch()
  const router = useRouter()

  const { companyName: company } = router.query

  useEffect(() => {
    setInProgressAction(dispatch, false)
    dispatch(setUIRenderAction(false))
    dispatch(getCompanyLogoAction(company, () => router.push(`/${company}/404`)))
  }, []);

  return (
    <>
      <Head>
        <title>Uplist | Buyer Register</title>
      </Head>
      <PublicLayout>
        <BuyerRegisterComponent />
      </PublicLayout>
    </>
  );
};

export default BuyerRegisterPage;
