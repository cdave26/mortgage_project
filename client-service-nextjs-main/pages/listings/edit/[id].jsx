import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getListingAction, isEditListingAction } from "~/store/listing/action";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import { getNumberOfUnitsAction } from "~/store/numberOfUnits/action";
import { getListingStatusAction } from "~/store/listingStatus/action";
import { getCompanyListByIdAction } from "~/store/company/action";

import AddListing from "~/components/listing/AddListingComponent";
import Layout from "~/layout/Layout";

const EditListings = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      const { pathname } = new URL(window.location.href);
      const listingId = pathname.split("/").pop();
      const isUplistAdmin = userData.user_type_id === 1;

      dispatch(isEditListingAction(true));

      // get listing
      dispatch(getListingAction(listingId));

      dispatch(getNumberOfUnitsAction());
      dispatch(getPropertyTypesAction(true));
      dispatch(getListingStatusAction());

      if (isUplistAdmin) {
        dispatch(getCompanyListByIdAction());
      }
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Edit Listing </title>
      </Head>
      <Layout>
        <AddListing />
      </Layout>
    </>
  );
};

export default EditListings;
