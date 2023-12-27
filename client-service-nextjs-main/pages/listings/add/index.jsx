import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getStatesPerCompanyAction } from "~/store/state/action";
import {
  isEditListingAction,
  selectedListingAction,
} from "~/store/listing/action";
import { getPropertyTypesAction } from "~/store/propertyType/action";
import { getNumberOfUnitsAction } from "~/store/numberOfUnits/action";
import { getListingStatusAction } from "~/store/listingStatus/action";
import { getCompanyListByIdAction } from "~/store/company/action";
import { getLicenseStatesPerUserAction } from "~/store/licenses/action";

import AddListing from "~/components/listing/AddListingComponent";
import Layout from "~/layout/Layout";

const AddListings = () => {
  const dispatch = useDispatch();

  const { updateListing } = useSelector(
    (state) => state.listings,
    shallowEqual
  );

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      const isUplistAdmin = userData.user_type_id === 1;

      // double check if there is existing data for update
      if (Object.keys(updateListing.listing).length) {
        dispatch(isEditListingAction(false));
        dispatch(selectedListingAction({}));
      }

      dispatch(getNumberOfUnitsAction());
      dispatch(getPropertyTypesAction(true));
      dispatch(getListingStatusAction());

      if (isUplistAdmin) {
        dispatch(getCompanyListByIdAction());
      } else {
        dispatch(getStatesPerCompanyAction(userData.company_id));
        dispatch(getLicenseStatesPerUserAction(userData.id));
      }
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Add Listings </title>
      </Head>
      <Layout>
        <AddListing />
      </Layout>
    </>
  );
};

export default AddListings;
