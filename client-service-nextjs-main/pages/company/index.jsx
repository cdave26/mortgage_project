import React, { useEffect } from "react";
import CompanyComponent from "~/components/company/CompanyComponent";
import Head from "next/head";
import { companyListAction } from "~/store/company/action";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { getStatesAction } from "~/store/state/action";
import Layout from "~/layout/Layout";
import { defaultPagination } from "~/utils/constants";

const Company = () => {
  const dispatch = useDispatch();
  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      dispatch(
        companyListAction({
          name: "",
          company_nmls_number: "",
          state: "",
          page: 1,
          limit: defaultPagination.pageSize,
          sortBy: "",
        })
      );
      dispatch(getStatesAction());
    }
  }, [userData]);
  return (
    <>
      <Head>
        <title> Uplist | Company </title>
      </Head>
      <Layout>
        <CompanyComponent />
      </Layout>
    </>
  );
};

export default Company;
