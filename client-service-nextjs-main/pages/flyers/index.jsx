import React, { useEffect } from "react";
import Layout from "~/layout/Layout";
import Head from "next/head";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import { viewAllFlyers } from "~/store/flyers/action";
import { getFullUserListAction } from "~/store/users/action";
import userTypes from "~/enums/userTypes";
import { getCompanyListByIdAction } from "~/store/company/action";
import { defaultPagination } from "~/utils/constants";

import FlyerManagementComponent from "~/components/flyer-management/FlyerManagementComponent";

const Flyer = () => {
  const dispatch = useDispatch();
  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);
  useEffect(() => {
    if (userData) {
      dispatch(getFullUserListAction());

      if (userData?.user_type_id === userTypes.UPLIST_ADMIN) {
        dispatch(getCompanyListByIdAction());
      }

      dispatch(
        viewAllFlyers({
          page: 1,
          limit: defaultPagination.pageSize,
          sortBy: "",
          search: "",
          addressSearch: "",
          activeArchive: "active",
          created_by: "",
          companyId: null,
        })
      );
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Flyer Database </title>
      </Head>
      <Layout>
        <FlyerManagementComponent />
      </Layout>
    </>
  );
};

export default Flyer;
