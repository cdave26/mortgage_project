import React from "react";
import { useRouter } from "next/router";
import { shallowEqual, useSelector } from "react-redux";
import { Col, Row } from "antd";

import CustomButton from "../base/CustomButton";
import CustomDivider from "../base/CustomDivider";

import {
  manageBuyers,
  manageFlyers,
  manageListings,
  manageQuickQuote,
  manageSettings,
  manageUsers,
} from "./MenuList";

const DashboardComponent = () => {
  const router = useRouter();
  const { user: authenticatedUser } = useSelector((state) => {
    return {
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const renderList = {
    uplist_admin: [
      manageListings,
      manageFlyers("uplist_admin"),
      manageSettings("uplist_admin"),
      manageUsers,
    ],
    company_admin: [
      manageListings,
      manageFlyers("company_admin"),
      manageSettings("company_admin", authenticatedUser.company_id),
      manageUsers,
    ],
    loan_officer: [
      manageListings,
      manageQuickQuote,
      manageBuyers,
      manageFlyers("loan_officer"),
    ],
  };

  return (
    <div className="pb-16">
      <h2 className="text-4xl text-denim font-sharp-sans-bold mt-0 mb-3">
        {authenticatedUser
          ? `Welcome, ${authenticatedUser.first_name}!`
          : "Loading..."}
      </h2>
      <CustomDivider />

      <p className="font-sharp-sans text-neutral-2 text-body-2">
        From the tiles below, easily create SmartView™ Flyers for listings, use
        the Quick Quote feature to get fast rate and payment quotes from your
        mobile device, leverage the SmartBuyer™ Tool to provide potential buyers
        with their own custom search tool, and share marketing flyers with your
        business partners.
      </p>

      <div className="flex justify-center items-center mt-10">
        <Row gutter={[24, 24]} justify="center">
          {authenticatedUser &&
            renderList[authenticatedUser.user_type.name].map((item, index) => {
              return (
                <Col
                  xl={
                    renderList[authenticatedUser.user_type.name].length > 3
                      ? 6
                      : 8
                  }
                  xs={24}
                  sm={12}
                  key={index}
                >
                  <div className="h-full shadow-default rounded-2xl">
                    <div className="flex h-full flex-col justify-between items-center p-10">
                      <div
                        className="font-sharp-sans-bold text-denim mb-4 text-header-5 text-center"
                        style={{ letterSpacing: "-0.24px" }}
                      >
                        {item.title}
                      </div>
                      <div
                        className="font-sharp-sans text-neutral-2 text-body-3 mb-8 text-center"
                        style={{ letterSpacing: "-0.24px" }}
                      >
                        {item.description}
                      </div>
                      <div className="w-full">
                        <CustomButton
                          onClick={() => router.push(item.url)}
                          label={item.textButton}
                          isfullwidth={true}
                        />
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
        </Row>
      </div>
    </div>
  );
};

export default DashboardComponent;
