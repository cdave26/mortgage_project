import React, { useEffect } from 'react';
import Head from 'next/head';
import AddUserComponent from '~/components/AddUser/AddUserComponent';
import { getPricingEngineAction } from '~/store/pricingEngine/action';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { getUserTypesAction } from '~/store/auth/action';
import Layout from '~/layout/Layout';
import { getCompanyListByIdAction } from '~/store/company/action';
const AddUsers = () => {
  const dispatch = useDispatch();

  const { company } = useSelector((state) => {
    return {
      company: state.company.companyList.company,
    };
  }, shallowEqual);

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);
  useEffect(() => {
    if (userData) {
      dispatch(getPricingEngineAction());
      dispatch(getUserTypesAction());
      if (company.length === 0) {
        dispatch(getCompanyListByIdAction());
      }
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Add Users </title>
      </Head>
      <Layout>
        <AddUserComponent />
      </Layout>
    </>
  );
};

export default AddUsers;
