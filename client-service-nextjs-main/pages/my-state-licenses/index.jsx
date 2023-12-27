import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getStatesPerCompanyAction } from "~/store/state/action";
import { getLicenseListAction } from "~/store/licenses/action";
import LicenseList from "~/components/state-license/LicenseListComponent";
import Layout from "~/layout/Layout";
import { defaultPagination } from "~/utils/constants";
import { LICENSES } from "~/store/licenses/type";

const Licenses = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    //due to async issue: in the _app.js, the user data is not yet available
    if (userData) {
      dispatch(getStatesPerCompanyAction(userData.company_id));
      dispatch(
        getLicenseListAction({
          page: 1,
          limit: defaultPagination.pageSize,
          search: "",
          stateId: "",
          sortBy: "updated_at",
          order: "desc",
        })
      );
    }
  }, [userData]);

  useEffect(() => {
    dispatch({
      type: LICENSES.listOfLicenses,
      payload: {
        list: {},
        loading: true,
        page: 1,
        limit: defaultPagination.pageSize,
        search: '',
        stateId: '',
        sortBy: '',
        order: '',
      }
    })
  }, [])

  return (
    <>
      <Head>
        <title> Uplist | My State Licenses </title>
      </Head>
      <Layout>
        <LicenseList />
      </Layout>
    </>
  );
};

export default Licenses;
