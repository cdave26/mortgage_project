import React, { useEffect } from "react";
import Head from "next/head";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import {
  getListingAction,
  getListingGeneratedFlyerAction,
  getListingLogsAction,
} from "~/store/listing/action";
import { getFlyerTemplatesAction } from "~/store/flyers/action";
import { FLYERS } from "~/store/flyers/type";

import ListingDetails from "~/components/listing/ListingDetails";
import Layout from "~/layout/Layout";
import { defaultPagination } from "~/utils/constants";

const ViewListing = () => {
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  useEffect(() => {
    if (userData) {
      const { pathname } = new URL(window.location.href);
      const listingId = pathname.split("/").pop();

      // get listing
      dispatch(getListingAction(listingId));

      // get listing activity logs
      dispatch(
        getListingLogsAction({
          listingId,
          page: 1,
          limit: defaultPagination.pageSize,
          sortBy: "updated_at",
          order: "desc",
        })
      );
      // get listing generated flyers
      dispatch(getListingGeneratedFlyerAction({ listingId }));
      dispatch(
        getFlyerTemplatesAction({
          page: 1,
          limit: FLYERS.FLYER_TEMPLATE_SIZE,
          type: "listing",
        })
      );
    }
  }, [userData]);

  return (
    <>
      <Head>
        <title> Uplist | View Listing </title>
      </Head>
      <Layout>
        <ListingDetails />
      </Layout>
    </>
  );
};

export default ViewListing;
