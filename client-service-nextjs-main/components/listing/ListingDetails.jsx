import React, { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Col, Row, Skeleton } from "antd";
import { useRouter } from "next/router";
import Link from "next/link";
import { condoTypes } from "~/utils/listing";

import {
  deleteListingAction,
  isEditListingAction,
  selectedListingAction,
} from "~/store/listing/action";
import { getCompanyListByIdAction } from "~/store/company/action";
import { addCommas } from "~/plugins/formatNumbers";

import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import ListingActivityLogs from "./ListingActivityLogs";
import ListingFlyersList from "./ListingFlyersList";
import BackButton from "../base/buttons/BackButton";
import ContentHeader from "../base/common/ContentHeader";

const ListingDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { listing, loading } = useSelector(
    (state) => state.listings.updateListing,
    shallowEqual
  );

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);
  const isUplistAdmin = userData?.user_type_id === 1;

  const [isDelete, setIsDelete] = useState({
    open: false,
    listingtoDelete: null,
    onProgress: false,
  });

  const { pathname } = new URL(window.location.href);
  const listingId = pathname.split("/").pop();

  const isCondoType = condoTypes.includes(listing.property_type);

  const RenderContainer = ({
    label,
    mainprop,
    format = null,
    captialize = false,
    color = null,
    removedecimal = false,
  }) => {
    const addFormat = (val) => {
      if (format === "boolean") {
        return Boolean(val) === true ? "Yes" : "No";
      }

      if (!format) return val;

      if (format === "currency") {
        if (!val || val === "-") {
          return 0;
        }

        if (removedecimal) {
          return `$${addCommas(parseFloat(val).toFixed(0).toString())}`;
        }

        return `$${addCommas(val, true)}`;
      }

      if (format === "percent") {
        if (!val) {
          return "0";
        }

        return `${val}%`;
      }
    };

    return (
      <div>
        <div className="font-sharp-sans-medium text-neutral-3 mb-2">
          {label}
        </div>
        <div
          className={`text-base font-sharp-sans-medium break-all ${
            color ? color : "text-neutral-1"
          } ${!captialize ? "capitalize" : ""}`}
        >
          {loading ? (
            <Skeleton paragraph={{ rows: 0 }} />
          ) : (
            addFormat(listing[mainprop]) || "-"
          )}
        </div>
      </div>
    );
  };

  /**
   * On delete listing or cancel delete
   * @param {String} typeOfAction
   * @returns {void}
   */
  const footerOnAction = async (typeOfAction) => {
    if (typeOfAction === "cancel") {
      setIsDelete({
        open: false,
        listingtoDelete: null,
      });
    } else if (typeOfAction === "confirm") {
      setIsDelete({
        ...isDelete,
        onProgress: true,
      });

      const response = await dispatch(
        deleteListingAction(isDelete.listingtoDelete)
      );

      if (response) {
        setIsDelete({
          open: false,
          listingtoDelete: null,
          onProgress: false,
        });

        setTimeout(() => {
          window.location.href = "/listings";
        }, 500);
      } else {
        setIsDelete({
          ...isDelete,
          onProgress: false,
        });
      }
    }
  };

  const RenderRowWrapper = (subComponents) => {
    return (
      <Row className="flex justify-start break-all flex-col md:flex-row gap-6 items-start w-full">
        {subComponents.map((comp) => {
          const props = {
            label: comp.label,
            mainprop: comp.mainprop,
          };

          if (comp.captialize) {
            props.captialize = comp.captialize;
          }

          if (comp.removedecimal) {
            props.removedecimal = comp.removedecimal;
          }

          if (comp.format) {
            props.format = comp.format;
          }

          return (
            <Col key={comp.label} className="w-full flex-1">
              <RenderContainer {...props} />
            </Col>
          );
        })}
      </Row>
    );
  };

  const onUpdateListing = (e) => {
    e.preventDefault();
    router.push(`/listings/edit/${listingId}`);
  };

  const onDeleteListing = () => {
    setIsDelete({
      open: true,
      listingtoDelete: listingId,
    });
  };

  return (
    <Row>
      <Col sm={24} md={24} lg={24} className="mb-3">
        <BackButton
          className="mb-12"
          handleBack={() => {
            window.location.href = "/listings";
          }}
        />
      </Col>
      <Col sm={24} md={24} lg={24}>
        <ContentHeader
          title={"Listing Details"}
          hasUpdateBtn
          hasDeleteBtn
          updateBtnRoute={`/listings/edit/${listingId}`}
          updateBtnHandler={onUpdateListing}
          deleteBtnHandler={onDeleteListing}
        />
        <Row className="flex w-full border border-solid border-alice-blue box-border mt-10 p-8 rounded-3xl">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="w-full">
              <div className="flex flex-col gap-2">
                <div>
                  <div className="mt-0 mb-1">
                    <h3 className="text-neutral-1 font-sharp-sans-bold text-3xl m-0">
                      {loading ? (
                        <Skeleton paragraph={{ rows: 0 }} />
                      ) : (
                        `MLS${listing.mls_number}`
                      )}
                    </h3>
                  </div>
                  <div className="mb-3">
                    {!listing.mls_link ? (
                      <p className="my-0 text-xanth font-sharp-sans-bold">-</p>
                    ) : (
                      <Link
                        href={listing.mls_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="my-0 text-xanth font-sharp-sans-bold underline"
                      >
                        {listing.mls_link}
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="w-full flex-1">
                    <RenderContainer
                      label="Last Updated:"
                      mainprop="formatted_updated_at"
                      captialize={true}
                    />
                  </div>
                  <div className="w-full flex-1">
                    <RenderContainer
                      label="Loan Officer:"
                      mainprop="loan_officer"
                    />
                  </div>
                  <div className="w-full flex-1">
                    <RenderContainer
                      label="Listing Status:"
                      mainprop="listing_status_desc"
                      color="text-denim"
                    />
                  </div>
                  <div className="w-full flex-1">
                    <RenderContainer
                      label="Listing Created By:"
                      mainprop="loan_officer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Row>
        <div className="my-5">
          {/* <ListingFlyersList listingLink={listingLink} listingId={listingId} /> */}

          <ListingFlyersList
            listing={listing}
            loading={!listing.hasOwnProperty("id")}
          />
        </div>
        <div className="flex flex-col gap-6 my-5">
          <Row className="flex justify-center flex-col lg:flex-row gap-5 w-full">
            <Col className="flex-1 w-full h-auto border border-solid border-alice-blue box-border p-8 rounded-3xl">
              <h3 className="text-denim font-sharp-sans-bold text-2xl mt-0 mb-5">
                Property Info
              </h3>
              <div className="flex flex-col gap-6">
                {RenderRowWrapper([
                  { label: "Address", mainprop: "property_address" },
                  { label: "County", mainprop: "county" },
                ])}
                {RenderRowWrapper([
                  { label: "Apt, Suite", mainprop: "property_apt_suite" },
                  { label: "Zip", mainprop: "property_zip" },
                ])}
                {RenderRowWrapper([
                  { label: "City", mainprop: "property_city" },
                  { label: "Property Type", mainprop: "property_type_desc" },
                ])}
                {RenderRowWrapper([
                  { label: "State", mainprop: "state" },
                  { label: "Number of Units", mainprop: "units_count_desc" },
                ])}
              </div>
            </Col>

            <Col className="flex-1 w-full h-auto border border-solid border-alice-blue box-border p-8 rounded-3xl">
              <h3 className="text-denim font-sharp-sans-bold text-2xl mt-0 mb-5">
                Publisher
              </h3>
              <div className="flex flex-col gap-6">
                {RenderRowWrapper([
                  { label: "Loan Officer", mainprop: "loan_officer" },
                  {
                    label: "Listing Status",
                    mainprop: "listing_status_desc",
                  },
                ])}
                {RenderRowWrapper([
                  {
                    label: "Licensing State",
                    mainprop: "user_license_state",
                  },
                  { label: "Licensing Number", mainprop: "license" },
                ])}
                {RenderRowWrapper([
                  {
                    label: "Loan Officer Contact Email",
                    mainprop: "email",
                    captialize: true,
                  },
                  {
                    label: "Loan Officer Contact Number",
                    mainprop: "mobile_number",
                  },
                ])}
              </div>
            </Col>
          </Row>

          <Row className="flex justify-center flex-col lg:flex-row gap-5 w-full">
            <Col className="flex-1 w-full h-auto border border-solid border-alice-blue box-border p-8 rounded-3xl">
              <h3 className="text-denim font-sharp-sans-bold text-2xl mt-0 mb-5">
                Mortgage and Payment Details
              </h3>
              <div className="flex flex-col gap-6">
                {RenderRowWrapper([
                  {
                    label: "List Price ($)",
                    mainprop: "property_value",
                    format: "currency",
                    removedecimal: true,
                  },
                  {
                    label: "Loan Amount ($)",
                    mainprop: "loan_amount",
                    format: "currency",
                    removedecimal: true,
                  },
                ])}
                {RenderRowWrapper([
                  {
                    label: "Seller Credits ($)",
                    mainprop: "seller_credits",
                    format: "currency",
                    removedecimal: true,
                  },
                  {
                    label: "HOA Dues ($/month)",
                    mainprop: "hoa_dues",
                    format: "currency",
                  },
                ])}
                {RenderRowWrapper([
                  {
                    label: "Credit Verified By",
                    mainprop: "credit_verified_by",
                  },
                  {
                    label: "Property Taxes ($/month)",
                    mainprop: "property_taxes",
                    format: "currency",
                  },
                ])}
                {RenderRowWrapper([
                  {
                    label: "Default Down Payment(%)",
                    mainprop: "default_down_payment",
                    format: "percent",
                  },
                  {
                    label: "Homeowners Insurance ($/month)",
                    mainprop: "homeowners_insurance",
                    format: "currency",
                  },
                ])}
              </div>
            </Col>
                           
            <Col lg={6} className="flex-1 h-auto border border-solid border-alice-blue box-border p-8 rounded-3xl">
              <h3 className="text-denim font-sharp-sans-bold text-2xl mt-0 mb-5">
                Additional Mortgage Options
              </h3>
              <div className="flex flex-col gap-5">
                {isCondoType
                  ? RenderRowWrapper([
                      {
                        label: "USDA Lookup",
                        mainprop: "usda_lookup",
                        format: "boolean",
                      },
                    ])
                  : RenderRowWrapper([
                      {
                        label: "USDA Lookup",
                        mainprop: "usda_lookup",
                        format: "boolean",
                      },
                    ])}
                  {isCondoType &&
                    RenderRowWrapper([
                      {
                        label: "FHA Condo Lookup",
                        mainprop: "fha_condo_lookup",
                        format: "boolean",
                      },
                    ])}
                  {isCondoType &&
                     RenderRowWrapper([
                      {
                        label: "VA Condo Lookup",
                        mainprop: "va_condo_lookup",
                        format: "boolean",
                      },
                    ])
                  }
                    
              </div>
            </Col>
            <Col lg={6} className="flex-1 w-full h-auto border border-solid border-alice-blue box-border p-8 rounded-3xl">
              <h3 className="text-denim font-sharp-sans-bold text-2xl mt-0 mb-5">
                Listing Agent Details
              </h3>
              <div className="flex flex-col gap-6">
                  { RenderRowWrapper([
                    {
                      label: "Agent Name",
                      mainprop: "listing_agent_name",
                    },
                   ])}
                  { RenderRowWrapper([
                    {
                      label: "Agent Email",
                      mainprop: "listing_agent_email",
                      captialize: true,
                    },
                   ])}
              </div>
            </Col>
          </Row>
        </div>
        <div className="mt-5 mb-10">
          <ListingActivityLogs />
        </div>
        <ConfirmDeleteModal
          title="You are about to delete a listing"
          subtitle="Flyers associated with this listing will be automatically archived."
          handleDelete={() => footerOnAction("confirm")}
          handleCancel={() => footerOnAction("cancel")}
          openModal={isDelete.open}
          onProgress={isDelete.onProgress}
        />
      </Col>
    </Row>
  );
};

export default ListingDetails;
