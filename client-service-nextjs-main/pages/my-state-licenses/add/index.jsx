import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import AddLicenseComponent from "~/components/state-license/AddLicenseComponent";
import { getStatesPerCompanyAction } from "~/store/state/action";
import { getLicenseListAction } from "~/store/licenses/action";
import Layout from "~/layout/Layout";
import { defaultPagination } from "~/utils/constants";
const AddLicenses = () => {
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

  return (
    <>
      <Head>
        <title> Uplist | Add License </title>
      </Head>
      <Layout>
        <AddLicenseComponent />
      </Layout>
    </>
  );
};

export default AddLicenses;
