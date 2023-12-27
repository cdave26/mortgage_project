import React, { useEffect } from "react";
import Head from "next/head";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import { getListingsAction } from "~/store/listing/action";
import { getListingStatusAction } from "~/store/listingStatus/action";
import { defaultPagination } from "~/utils/constants";

import ListingList from "~/components/listing/ListComponent";
import Layout from "~/layout/Layout";

const Listings = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    //due to async issue: in the _app.js, the user data is not yet available
    if (userData) {
      dispatch(
        getListingsAction({
          page: 1,
          limit: defaultPagination.pageSize,
          search: "",
          sortBy: "updated_at",
          order: "desc",
        })
      );
      dispatch(getListingStatusAction());
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | Listings </title>
      </Head>
      <Layout>
        <ListingList />
      </Layout>
    </>
  );
};

export default Listings;
