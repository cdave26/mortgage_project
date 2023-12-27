import React, { useContext, useEffect, useState } from "react";
import { renderToString } from "react-dom/server";
import { Col, Collapse, Form, Radio, Row } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import Link from "next/link";

import config from "~/config";
import {
  parseToDecimal,
  parseWholeAmount,
  removeNonIntegers,
} from "~/plugins/formatNumbers";
import { LiveInHomeRatesContext } from "~/utils/context";
import { listingGetPaymentsAction } from "~/store/publicstore/action";
import { onHandleError } from "~/error/onHandleError";
import { getCookie } from "~/store/auth/api";
import downPaymentTypes from "~/enums/downPaymentTypes";

import CustomFormItem from "../base/CustomFormItem";
import CustomButton from "../base/CustomButton";
import CustomInputNumber from "../base/CustomInputNumber";
import SendInquiryModal from "./SendInquiryModal";
import RenderGetPaymentsResultContainer from "../base/OptimalBlue/GetPaymentResultContainer";
import LoadingOBResultsComponent from "../base/OptimalBlue/LoadingOBResultsComponent";
import EmptyOBResultsComponent from "../base/OptimalBlue/EmptyOBResultsComponent";
import DisclosureAndAssumptionsComponent from "../disclosureAndAssumptions/DisclosureAndAssumptionsComponent";
import UplistGetPaymentButton from "../base/buttons/UplistGetPaymentButton";
import CustomSelect from "../base/CustomSelect";
import LoanOfficerDetails from "../base/LoanOfficerDetails";
import buydown from "~/enums/buydown";

const LiveInHomeRatesComponent = () => {
  const { contextData, stateSetter } = useContext(LiveInHomeRatesContext);
  const [disableSellerCredit, setDisableSellerCredit] = useState(false);
  const [hasBuyDownSelected, setHasBuyDownSelected] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const [form] = Form.useForm();
  const { Panel } = Collapse;
  const { id } = router.query;
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const {
    isFirstTimeBuyer,
    isVetMilitary,
    loanAmount,
    downPercent,
    creditScore,
    occupancyType,
    sellerCredits,
    loadingGetPayments,
    getPaymentResults,
    hasResults,
  } = contextData;

  const { publicListingData, creditScoreOptions, occupancyOptions } =
    useSelector((state) => {
      return {
        publicListingData: state.publicStore.publicListing.data,
        creditScoreOptions: state.creditScoreRange.items,
        occupancyOptions: state.occupancyType.items,
      };
    }, shallowEqual);

  useEffect(() => {
    if (Object.keys(publicListingData).length) {
      const { loan_amount, default_down_payment, property_value } =
        publicListingData;

      const payment = (default_down_payment * property_value) / 100;

      stateSetter({
        loanAmount: parseToDecimal(loan_amount, 0),
        downPercent: Number.isInteger(default_down_payment)
          ? default_down_payment
          : parseToDecimal(default_down_payment, 1),
        downPayment: parseToDecimal(payment, 0),
        sellerCredits: parseToDecimal(seller_credits, 0),
      });

      publicListingData.down_payment = parseToDecimal(payment, 0);

      for (const key in publicListingData) {
        form.setFields([
          {
            name: key,
            value: publicListingData[key],
          },
        ]);
      }
    }
  }, [publicListingData]);

  const {
    seller_credits,
    property_address,
    property_apt_suite,
    property_city,
    property_zip,
    property_value,
    mls_number,
    mls_link,
    va_condo_lookup,
    company: { header_background_color, header_text_color, equal_housing },
    user: { first_name, mobile_number },
    state: { abbreviation, name: stateName },
  } = publicListingData;

  const combinedAddress = (
    <>
      {property_apt_suite
        ? `${property_address}, ${property_apt_suite}`
        : `${property_address}`}
      <br />
      {`${property_city}, ${abbreviation} ${property_zip}`}
    </>
  );

  const combinedAddressString = renderToString(combinedAddress);

  const stringLength = combinedAddressString.length;

  const hasVALookup = va_condo_lookup;

  const boolValues = {
    true: "Yes",
    false: "No",
  };

  useEffect(() => {
    if (occupancyOptions.length && creditScoreOptions.length) {
      form.setFields([
        {
          name: "occupancy",
          value: occupancyType,
        },
        {
          name: "credit_score",
          value: creditScore,
        },
        {
          name: "buydown",
          value: {
            key: buydown.NONE,
            label: "None",
          },
        },
      ]);
    }
  }, [occupancyOptions, creditScoreOptions]);

  const handleFinish = async (values) => {
    const controller = new AbortController();
    const { signal } = controller;

    stateSetter({
      loadingGetPayments: true,
      hasResults: false,
      buydown: values.buydown,
    });

    try {
      await getCookie();
      const response = await listingGetPaymentsAction({
        listingId: id,
        body: {
          ...values,
          occupancy: values.occupancy?.value,
          credit_score: values.credit_score?.value,
          loan_amount: loanAmount,
          is_military_veteran: values.is_military_veteran ?? false,
          down_payment_type: downPaymentTypes.DOLLAR,
          buydown: values.buydown.key,
        },
        signal,
      });
      if (response.status === 200) {
        const initialResult = response.data.payments;
        const reorderedPayments = initialResult["Conforming"]
          ? { Conforming: initialResult["Conforming"], ...initialResult }
          : initialResult;

        const paymentResults = Object.keys(reorderedPayments);
        const mapped = paymentResults.map((res) => {
          if (!Object.keys(response.data.payments[res]).length) {
            return [];
          }
          return {
            ...response.data.payments[res],
            name: res,
          };
        });

        stateSetter({
          hasResults: true,
          getPaymentResults: !mapped.flat().length ? [] : mapped,
          loadingGetPayments: false,
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
      stateSetter({ loadingGetPayments: false });
    } finally {
      controller.abort();
    }
  };

  const handleLoanAmtCalc = (formName) => {
    const propertyValue = form.getFieldValue("property_value") ?? 0;
    let fieldDownPayment = form.getFieldValue("down_payment") ?? 0;
    let downPaymentPercentage = form.getFieldValue("default_down_payment") ?? 0;

    if (formName === "default_down_payment") {
      form.resetFields(["down_payment"]);

      downPaymentPercentage = Number.isInteger(downPaymentPercentage)
        ? downPaymentPercentage
        : parseToDecimal(downPaymentPercentage, 1);

      if (downPaymentPercentage > 100) {
        downPaymentPercentage = 100;
      }

      const calculatedDownPayment =
        (downPaymentPercentage * propertyValue) / 100;
      const loanAmount = propertyValue - calculatedDownPayment;

      stateSetter({
        loanAmount: parseToDecimal(loanAmount, 0),
        downPercent: downPaymentPercentage,
        downPayment: parseToDecimal(calculatedDownPayment, 0),
      });

      form.setFieldValue("default_down_payment", downPaymentPercentage);
      form.setFieldValue("loan_amount", parseToDecimal(loanAmount, 0));
      form.setFieldValue(
        "down_payment",
        parseToDecimal(calculatedDownPayment, 0)
      );
    }

    if (formName === "down_payment" || formName === "property_value") {
      form.resetFields(["default_down_payment"]);

      if (fieldDownPayment > propertyValue) {
        fieldDownPayment = parseToDecimal(propertyValue, 0);
        stateSetter({
          downPayment: fieldDownPayment,
        });

        form.setFieldValue("down_payment", fieldDownPayment);
      }

      let percentage = (fieldDownPayment / propertyValue) * 100;

      percentage = isNaN(percentage) ? 0 : percentage;
      percentage = Number.isInteger(percentage)
        ? percentage
        : parseToDecimal(percentage, 1);

      const calculatedDownPayment = (Number(percentage) * propertyValue) / 100;
      const loanAmount = propertyValue - fieldDownPayment;

      stateSetter({
        loanAmount: parseToDecimal(loanAmount, 0),
        downPercent: percentage,
        downPayment: parseToDecimal(calculatedDownPayment, 0),
      });

      form.setFieldValue("loan_amount", parseToDecimal(loanAmount, 0));
      form.setFieldValue("default_down_payment", percentage);
    }
  };

  const renderOBResults = () => {
    if (loadingGetPayments) {
      return <LoadingOBResultsComponent />;
    }

    if (!loadingGetPayments && hasResults) {
      if (getPaymentResults.length) {
        return (
          <Row
            gutter={[20, 40]}
            className="justify-center mt-5 flex pb-10 mx-auto"
          >
            <RenderGetPaymentsResultContainer
              getPaymentResults={getPaymentResults}
              source="live-in-home-rates"
            />
          </Row>
        );
      } else {
        return <EmptyOBResultsComponent />;
      }
    }

    return <></>;
  };

  const buydownOptions = () => [
    {
      key: buydown.NONE,
      label: "None",
    },
    {
      key: buydown.THREE_TWO_ONE,
      label: "3/2/1",
    },
    {
      key: buydown.TWO_ONE,
      label: "2/1",
    },
    {
      key: buydown.ONE_ZERO,
      label: "1/0",
    },
  ];

  const onChangeBuydownOption = (selected) => {
    if (selected.key === buydown.NONE) {
      setDisableSellerCredit(false);
      setHasBuyDownSelected(false);
      return;
    }

    form.setFieldValue("seller_credits", 0);
    stateSetter({ sellerCredits: 0 });
    setDisableSellerCredit(true);
    setHasBuyDownSelected(true);
  };

  return (
    <div className="px-5">
      <Row
        className="flex items-center justify-center mx-auto px-[10px] py-[25px]"
        style={{
          backgroundColor:
            first_name === "Homeseed" ? "#000000" : header_background_color,
          maxWidth: 1050,
        }}
      >
        <div
          className="text-center"
          style={{ color: header_text_color, maxWidth: "100%" }}
        >
          <div className="mb-8">
            <div>
              <h3
                className={`text-3xl font-sharp-sans-bold capitalize my-0 text-inherit address-text ${
                  stringLength < 40 && stringLength <= 64
                    ? "adjust-small-font"
                    : ""
                } ${
                  stringLength > 40 && stringLength <= 64
                    ? "adjust-medium-font"
                    : ""
                } ${stringLength > 65 ? "adjust-long-font" : ""}`}
              >
                {combinedAddress}
              </h3>
            </div>
          </div>
          <div className="mb-8">
            <p className="text-header-5 font-sharp-sans-bold my-0">
              Price: ${parseWholeAmount(property_value)}
            </p>
          </div>
          <div className="mb-2">
            <p className="text-base font-sharp-sans-semibold my-0">
              Down Payment: {downPercent}%
            </p>
          </div>
          <div className="mb-2">
            <p className="text-base font-sharp-sans-semibold my-0">
              Loan Amount: ${parseWholeAmount(loanAmount)}
            </p>
          </div>
          <div className="mb-2">
            <p className="text-base font-sharp-sans-semibold my-0">
              Military/Veteran: {boolValues[isVetMilitary]}
            </p>
          </div>
          <div className="mb-8">
            <p className="text-base font-sharp-sans-semibold my-0">
              First Time Home Buyer: {boolValues[isFirstTimeBuyer]}
            </p>
          </div>
          <div>
            <Link
              href={mls_link ?? "/#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-sharp-sans-semibold my-0 text-inherit"
            >
              MLS-{mls_number}
            </Link>
          </div>
        </div>
      </Row>

      <div style={{ maxWidth: 834 }} className="w-full mx-auto px-5">
        <Row className="my-10 flex justify-between mx-auto w-full">
          <Form
            layout="vertical"
            form={form}
            className="mt-5 w-full"
            onFinish={handleFinish}
          >
            <Col className="flex md:gap-4 w-full flex-col md:flex-row">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Offer Price"
                  name="property_value"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    type="currency"
                    placeholder="Enter offer price"
                    prefix={"$"}
                    onChange={() => handleLoanAmtCalc("property_value")}
                    precision={0}
                    min={0}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Down Payment"
                  name="down_payment"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    type="currency"
                    placeholder="Enter down payment"
                    prefix={"$"}
                    onChange={() => handleLoanAmtCalc("down_payment")}
                    precision={0}
                    min={0}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Down %"
                  name="default_down_payment"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    placeholder="Enter down %"
                    suffix={"%"}
                    onChange={() => handleLoanAmtCalc("default_down_payment")}
                    precision={1}
                    step={0.1}
                    min={0}
                  />
                </CustomFormItem>
              </div>
            </Col>
            <Col className="flex md:gap-4 w-full flex-col md:flex-row">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Credit Score"
                  name="credit_score"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    placeholder="Select Credit Score"
                    options={creditScoreOptions}
                    onChange={(opt) => {
                      stateSetter({ creditScore: opt });
                    }}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Occupancy"
                  name="occupancy"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    placeholder="Select Occupancy"
                    options={occupancyOptions}
                    onChange={(opt) => stateSetter({ occupancyType: opt })}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Seller Credit"
                  name="seller_credits"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                  initialValue={sellerCredits}
                >
                  <CustomInputNumber
                    type="curreny"
                    placeholder="Enter Seller Credit"
                    prefix={"$"}
                    onChange={(val) => {
                      stateSetter({ sellerCredits: val });
                    }}
                    precision={0}
                    min={0}
                    disabled={disableSellerCredit}
                  />
                </CustomFormItem>
              </div>
            </Col>
            <Col className="grid grid-cols-1 gap-y-4 md:grid-cols-3 md:gap-x-4">
              <div className="buydown-dropdown order-1">
                <CustomFormItem label="Buydown" name="buydown">
                  <CustomSelect
                    placeholder="Select Buydown"
                    options={buydownOptions()}
                    onChange={onChangeBuydownOption}
                  />
                </CustomFormItem>
              </div>
              {hasBuyDownSelected && (
                <div className="justify-self-center col-span-3 order-2 md:order-3">
                  <div
                    className="border border-solid rounded-lg border-warning-1 bg-warning-2
                  font-sharp-sans-semibold text-neutral-1 text-sm text-center w-fit p-4"
                  >
                    When selecting a buydown, the seller credit field is
                    disabled. Search results will show the minimum seller credit
                    required for the buydown.
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 col-span-2 gap-4 order-3 md:order-2">
                {hasVALookup && (
                  <CustomFormItem
                    label="Military/Veteran"
                    name="is_military_veteran"
                    required
                    initialValue={isVetMilitary}
                    mb="0"
                    rules={config.requiredRule.slice(0, 1)}
                  >
                    <Radio.Group
                      onChange={(e) => {
                        stateSetter({
                          isVetMilitary: e.target.value,
                        });
                      }}
                    >
                      <Radio value={true}>Yes</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  </CustomFormItem>
                )}
                <div>
                  <CustomFormItem
                    label="First Time Home Buyer"
                    name="is_first_time_buyer"
                    required
                    initialValue={isFirstTimeBuyer}
                    mb="0"
                    rules={config.requiredRule.slice(0, 1)}
                  >
                    <Radio.Group
                      onChange={(e) => {
                        stateSetter({
                          isFirstTimeBuyer: e.target.value,
                        });
                      }}
                    >
                      <Radio value={true}>Yes</Radio>
                      <Radio value={false}>No</Radio>
                    </Radio.Group>
                  </CustomFormItem>
                </div>
              </div>
            </Col>
            <Col className="w-full flex flex-col items-center justify-center mt-12">
              <UplistGetPaymentButton loadingGetPayments={loadingGetPayments} />
            </Col>
          </Form>
        </Row>

        {renderOBResults()}

        {!!parseFloat(sellerCredits) ? (
          <Row className="mb-10 flex items-center justify-center text-center">
            <h3 className="font-sharp-sans my-0">
              Pricing assumes seller credit of $
              {parseWholeAmount(sellerCredits)}
            </h3>
          </Row>
        ) : (
          <></>
        )}

        {stateName === "Utah" && (
          <div className="w-full mb-10 text-center">
            <p
              className="text-neutral-1 font-sharp-sans-semibold text-base flex-1 w-full mx-auto my-0 justify-center items-center"
              style={{ maxWidth: "622px" }}
            >
              We are unable to provide information regarding this property for
              sale. Please contact a licensed real estate agent.
            </p>
          </div>
        )}

        <Row className="w-full mx-auto">
          <div className="mb-2 text-center w-full">
            <p className="my-0 text-neutral-1 text-base font-sharp-sans-bold">
              Contact me for details or other loan options
            </p>
          </div>
          <div className="bg-gray-2 w-full mx-auto flex justify-center items-center flex-col border border-solid border-alice-blue rounded-lg p-8">
            <LoanOfficerDetails userData={publicListingData?.user} />
            <div className="flex gap-4 flex-row flex-wrap items-center justify-center">
              {isMobileDevice && mobile_number && (
                <>
                  <CustomButton
                    iscalltoaction
                    label="Call"
                    type="link"
                    href={`tel:${removeNonIntegers(mobile_number)}`}
                  />
                  <CustomButton
                    iscalltoaction
                    label="Text"
                    type="link"
                    href={`sms:${removeNonIntegers(mobile_number)}`}
                  />
                </>
              )}
              <CustomButton
                iscalltoaction
                label="Email"
                onClick={() => stateSetter({ showModal: true })}
              />
            </div>
          </div>
        </Row>
        <Row className="mt-10 w-full mx-auto">
          <div className="w-full mx-auto flex justify-center items-center flex-col">
            <Collapse className="bg-white w-full mx-auto flex justify-center items-center flex-col">
              <Panel
                header="Disclosures and Assumptions"
                className="homerates-collapse-panel w-full text-base md:text-xl font-sharp-sans-bold border-alice-blue rounded-lg"
                showArrow={false}
                extra={<DownOutlined style={{ fontSize: 18 }} />}
              >
                {
                  <DisclosureAndAssumptionsComponent
                    licenseData={publicListingData}
                    hasBuyDownSelected={hasBuyDownSelected}
                  />
                }
              </Panel>
            </Collapse>
          </div>
        </Row>
        <Row className="mt-10 pb-16 flex justify-center">
          <div className="w-20 h-20">
            <img
              src={`${window.location.origin}/icon/${equal_housing}.png`}
              alt={`${equal_housing}-logo-png-transparent`}
              loading="lazy"
              className="w-full h-full"
            />
          </div>
        </Row>
      </div>
      <SendInquiryModal />
    </div>
  );
};

export default LiveInHomeRatesComponent;
