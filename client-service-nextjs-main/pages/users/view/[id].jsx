import React, { useEffect } from "react";
import UserDetails from "~/components/userDetails/UserDetails";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getUserAction } from "~/store/users/action";
import Layout from "~/layout/Layout";
import { createElementsToDom } from "~/error/onHandleError";

const ViewUserDetails = () => {
  const dispatch = useDispatch();
  const { updateUser } = useSelector((state) => state.users, shallowEqual);
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
        dispatch(getUserAction(isValidNumber));
      }
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | User Details </title>
      </Head>
      <Layout>
        <UserDetails />
      </Layout>
    </>
  );
};

export default ViewUserDetails;
