import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Card } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { Col, Row } from "antd";

import { getCookie } from "~/store/auth/api";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import { getHubspotCompany, getHubspotContact } from "~/store/hubspot/api";
import { postCheckout } from "~/store/stripe/api";

import CustomButton from "~/components/base/CustomButton";
import CustomDivider from "~/components/base/CustomDivider";

import checkIcon from "src/assets/img/check.svg";

const PricingCard = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const queries = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedContact, setVerifiedContact] = useState(null);

  const errorTimeout = 3000;

  const snackBar = (message, description, type) => {
    dispatch({
      type: "UI/snackbars",
      payload: {
        open: true,
        message,
        description,
        position: "topRight",
        type,
      },
    });
  };

  const checkHubspotContact = (fromEnterprise = false) => {
    const query = {
      contact_id: queries.contactId,
    };

    if (fromEnterprise) {
      query.enterprise_app = true;
    }

    getHubspotContact(query)
      .then((res) => {
        snackBar(res.data.message, "", "success");
        setIsLoading(false);
        setVerifiedContact(queries.contactId);
      })
      .catch((err) => {
        onHandleError(err, dispatch);
        window.localStorage.removeItem("hubspotCompany");
        setIsLoading(false);

        setTimeout(() => {
          window.location.href = "/";
        }, errorTimeout);
      });
  };

  const checkHubspotCompany = () => {
    getCookie().then(() => {
      getHubspotCompany({
        company_id: queries.companyId,
        billing_type: "individual",
      })
        .then((res) => {
          snackBar(res.data.message, "", "success");

          window.localStorage.setItem(
            "hubspotCompany",
            JSON.stringify(res.data.hubspot_company)
          );

          if (
            queries.enterpriseApp &&
            queries.enterpriseApp === "true" &&
            queries.contactId
          ) {
            checkHubspotContact(true);
            return;
          }

          if (queries.contactId) {
            checkHubspotContact();
            return;
          }

          setIsLoading(false);
        })
        .catch((err) => {
          onHandleError(err, dispatch);
          setIsLoading(false);

          setTimeout(() => {
            window.location.href = "/";
          }, errorTimeout);
        });
    });
  };

  const getHubspotData = () => {
    if (!queries.companyId) {
      snackBar("No company ID attached in the URL.", "", "error");

      setIsLoading(false);

      setTimeout(() => {
        window.location.href = "/";
      }, errorTimeout);
      return;
    }

    // proceed to check if company exists in Web App and Hubspot
    checkHubspotCompany();
  };

  /**
   * URL:
   *
   * TYPE 2
   * <URL>/pricing?res=checkout&companyId={companyId}&contactId={contactId}
   *
   * TYPE 3
   * <URL>/pricing?res=checkout&companyId={companyId}
   *
   */
  useEffect(() => {
    setIsLoading(true);
    if (!queries || queries.res !== "checkout") {
      snackBar("The URL is invalid.", "", "error");

      setTimeout(() => {
        window.location.href = "/";
      }, errorTimeout);
      return;
    }

    getHubspotData();
  }, []);

  const handleCheckout = async (pricing_id) => {
    setIsLoading(true);

    if (!queries.companyId) {
      snackBar(
        "Company not found. Please contact your administrator.",
        "",
        "error"
      );
    }

    try {
      await getCookie();
      const controller = new AbortController();
      const { signal } = controller;

      const query = {
        price_id: pricing_id,
        company_id: queries.companyId,
      };

      if (queries.enterpriseApp && queries.enterpriseApp === "true") {
        query.enterprise_app = true;
      }

      if (verifiedContact) {
        query.contact_id = verifiedContact;
      }

      const response = await postCheckout(query, signal);

      if (response.status === 200) {
        window.location = response.data.checkout_url;
      }

      setIsLoading(false);
    } catch (error) {
      onHandleError(error, dispatch);
      setIsLoading(false);
    }
  };

  // const plans = [
  //   {
  //     title: "Option 1",
  //     price: "$59",
  //     pricingItems: ["6 active listings", "$599 upfront for the year "],
  //     pricing_id: config.stripe.pricing.pricing1,
  //     isFeatured: false,
  //     disabled: false,
  //   },
  //   {
  //     title: "Option 2",
  //     price: "$99",
  //     pricingItems: ["10 listings", "$999 upfront for the years"],
  //     pricing_id: config.stripe.pricing.pricing2,
  //     isFeatured: false,
  //     disabled: false,
  //   },
  //   {
  //     title: "Option 3",
  //     price: "$149",
  //     pricingItems: ["unlimited listings", "$1,499 for the year upfront"],
  //     pricing_id: config.stripe.pricing.pricing3,
  //     isFeatured: false,
  //     disabled: false,
  //   },
  // ];

  /**
   * @TODO REPLACE this plans with the one above after the special lunching
   */
  const plans = [
    {
      title: "Regular Price",
      price: "$125",
      pricingItems: ["unlimited listings", "$1,499 billed annually"],
      pricing_id: config.stripe.pricing.pricing3,
      isFeatured: false,
      disabled: true,
    },
    {
      title: "Special Launch Price",
      price: "$66",
      pricingItems: ["unlimited listings", "$799 billed annually"],
      pricing_id: config.stripe.pricing.specialLaunchPrice,
      isFeatured: true,
      disabled: false,
    },
  ];

  return (
    <div className="h-full flex items-center">
      <Row className="w-full content-center">
        <div className="w-full text-center mb-16">
          <h1 className="text-5xl text-denim font-sharp-sans-bold block mt-0 mb-4">
            Select A Plan
          </h1>
          <CustomDivider className="m-auto block " />
          {/* <p className="font-sharp-sans-medium mb-16 leading-7">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            <br />
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p> */}
        </div>
        <div className="container-pricing-cards place-items-center content-center m-auto">
          <Row gutter={[16, 32]} justify="center">
            {plans.map((plan, index) => {
              const {
                title,
                price,
                pricingItems,
                pricing_id,
                isFeatured,
                disabled,
              } = plan;
              return (
                <Col xs={24} sm={24} lg={12} xl={6} key={index}>
                  <Card
                    title={title}
                    className={`${isFeatured ? "featured" : ""} ${
                      disabled ? "disabled text-neutral-4" : "text-neutral-2"
                    } pricing-card shadow-default rounded-3xl w-72 text-center m-auto font-sharp-sans-semibold py-10`}
                    bordered={false}
                  >
                    <p className="inline-flex items-center">
                      <span
                        className={`${
                          disabled ? "text-neutral-4" : "text-denim"
                        } card-price font-sharp-sans-bold text-5xl`}
                      >
                        {price}
                      </span>
                      <span
                        className={`card-month ${
                          disabled ? "text-neutral-3" : "text-neutral-2"
                        } font-sharp-sans-medium text-base ml-4`}
                      >
                        /Month
                      </span>
                    </p>

                    <ul className="ant-list-items text-left mt-5">
                      {pricingItems.map((item, index) => (
                        <div style={{ display: "flex" }} key={index}>
                          <Image
                            src={checkIcon}
                            alt=""
                            className="h-5 mt-0.5"
                            width={20}
                            height={20}
                            style={{ opacity: disabled ? "0.4" : "1" }}
                          />
                          <li className="text-lg text-left font-sharp-sans-medium ml-3.5 mb-2">
                            {item}
                          </li>
                        </div>
                      ))}
                    </ul>

                    <CustomButton
                      className="select-plan-btn text-neutral-1 mt-8 w-53 font-sharp-sans-bold"
                      label="Choose Plan"
                      type="primary"
                      onClick={() => handleCheckout(pricing_id)}
                      disabled={disabled ? true : isLoading}
                      isloading={disabled ? "false" : isLoading.toString()}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </Row>
    </div>
  );
};

export default PricingCard;
