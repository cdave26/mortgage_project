import React, { useEffect } from "react";
import Head from "next/head";
import AddUserComponent from "~/components/AddUser/AddUserComponent";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getUserAction, isEditUserAction } from "~/store/users/action";
import { getUserTypesAction } from "~/store/auth/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import Layout from "~/layout/Layout";
import { getCompanyListByIdAction } from "~/store/company/action";
import { createElementsToDom } from "~/error/onHandleError";
const EditUser = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      const { pathname } = new URL(window.location.href);
      const isValidNumber = pathname.split("/").pop();
      if (isNaN(Number(isValidNumber))) {
        createElementsToDom(404);
      } else {
        dispatch(getPricingEngineAction());
        dispatch(getUserTypesAction());
        dispatch(getCompanyListByIdAction());
        dispatch(isEditUserAction(true));
        dispatch(getUserAction(isValidNumber));
      }
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Edit User </title>
      </Head>
      <Layout>
        <AddUserComponent />
      </Layout>
    </>
  );
};

export default EditUser;
