import React, { useContext, useEffect, useState } from "react";
import {
  Col,
  Form,
  Row,
  Button,
  Radio,
  Collapse,
  ConfigProvider,
  Grid,
} from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { getCountiesPerStateAction } from "~/store/county/action";
import CustomDivider from "../base/CustomDivider";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomInputNumber from "../base/CustomInputNumber";
import Select from "../Select/Select";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import CustomTextArea from "../base/CustomTextArea";
import { getBuyerAction, updateBuyerAction } from "~/store/buyer/action";
import { onHandleError } from "~/error/onHandleError";
import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { removeDecimal } from "~/plugins/formatNumbers";
import SendEmailModal from "./SendEmailModal";
import config from "~/config";
import { validateMobileNumber } from "~/plugins/mobileNumber";
import { onMobileNumber } from "~/lib/events";
import Link from "next/link";
import {
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  setSpinningAction,
} from "~/store/ui/action";
import CustomButton from "../base/CustomButton";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import { getLoanOfficerAction } from "~/store/loanOfficer/action";
import { HomePriceContext } from "~/utils/context";
import CustomSelect from "../base/CustomSelect";

const BuyerProfile = ({ id: buyerID }) => {
  const { stateSetter } = useContext(HomePriceContext);
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    user,
    states,
    counties,
    buyer,
    isLoading,
    propertyTypes,
    occupancyTypes,
    creditScoreRanges,
    numberOfUnits,
    formChange: { isChange, isModalOpen, url },
    loanOfficer,
  } = useSelector(
    ({
      auth,
      licenseStates,
      counties,
      buyer,
      propertyType,
      occupancyType,
      creditScoreRange,
      numberOfUnits,
      loanOfficer,
      ui,
    }) => {
      return {
        user: auth.data.user,
        states: licenseStates.states.data,
        counties: counties.countiesPerState.data,
        buyer: buyer.buyerDetails,
        isLoading: buyer.isLoading,
        propertyTypes: propertyType.items,
        occupancyTypes: occupancyType.items,
        creditScoreRanges: creditScoreRange.items,
        numberOfUnits: numberOfUnits.data,
        formChange: ui.formChange,
        loanOfficer: loanOfficer.loanOfficerDetails,
      };
    },
    shallowEqual
  );

  const [countyItems, setCountyItems] = useState([]);
  const [defaultDownPaymentUnit, setDefaultDownPaymentUnit] = useState();
  const [hasDownPaymentValue, setHasDownPaymentValue] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isAppending, setIsAppending] = useState(true);
  const [downPaymentRules, setDownPaymentRules] = useState([
    {
      required: true,
    },
  ]);
  const [form] = Form.useForm();
  const { Panel } = Collapse;
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.sm === false;

  const mapSelected = (val, prop, checker = "id") => {
    const filtered = prop.filter((x) => x[checker] === val);
    if (!filtered.length) return {};

    const mapped = filtered.map((y) => {
      return {
        label: checker === "id" ? y.value : y.label,
        value: y[checker],
      };
    });
    return mapped[0];
  };

  useEffect(() => {
    if (Object.keys(buyer).length) {
      setDefaultDownPaymentUnit(buyer.default_down_payment_type);
      setIsAppending(false);

      form.setFieldsValue({
        ...buyer,
        borrower_state: mapSelected(buyer.borrower_state.id, states, "key"),
        borrower_zip: String(buyer.borrower_zip),
        credit_score_range: mapSelected(
          buyer?.credit_score_range?.id,
          creditScoreRanges
        ),
        default_down_payment_value: parseFloat(
          removeDecimal(buyer.default_down_payment_value)
        ),
        max_qualifying_payment: String(
          removeDecimal(buyer.max_qualifying_payment)
        ),
        max_down_payment: String(removeDecimal(buyer.max_down_payment)),
        occupancy_type: mapSelected(buyer.occupancy_type.id, occupancyTypes),
        property_type: mapSelected(buyer.property_type.id, propertyTypes),
        property_state: mapSelected(buyer.property_state.id, states, "key"),
        units: mapSelected(buyer.unit.id, numberOfUnits, "value"),
        homeowners_insurance: buyer.homeowners_insurance,
        borrower_mobile_number: buyer.borrower_mobile_number,
      });
      dispatch(getLoanOfficerAction(buyer.loan_officer.id));
    }

    if (states.length && Object.keys(buyer).length) {
      const stateId = getKeyValue(states, buyer.property_state.full_state);
      stateId && dispatch(getCountiesPerStateAction(stateId));
    }
  }, [
    buyer,
    states,
    occupancyTypes,
    numberOfUnits,
    propertyTypes,
    creditScoreRanges,
  ]);

  useEffect(() => {
    if (Object.keys(buyer).length && Object.keys(loanOfficer).length) {
      stateSetter({ buyerData: { buyer, loanOfficer } });
    }
  }, [buyer, loanOfficer]);

  useEffect(() => {
    setCountyItems(counties);
    if (Object.keys(buyer).length) {
      form.setFieldsValue({
        property_county: mapSelected(buyer.property_county.id, counties, "key"),
      });
    }
  }, [counties, buyer]);

  useEffect(() => {
    setDownPaymentRules(
      defaultDownPaymentUnit === "PERCENTAGE"
        ? [
            {
              required: true,
              type: "number",
              min: 0,
              max: 100,
            },
          ]
        : [
            {
              required: true,
            },
          ]
    );
  }, [defaultDownPaymentUnit]);

  const onPropagation = (change, open, url) => {
    dispatch(formDialogAlert(change, open, url));
  };

  const handleReturnAction = () => {
    form.resetFields();

    if (url) {
      return (window.location.href = url);
    }

    router.push("/buyer");
  };

  const handleFinish = async (values) => {
    onPropagation(false, false, "");
    const formattedValues = formatValues(values, buyer);
    const controller = new AbortController();
    try {
      dispatch(setSpinningAction(true));
      const response = await updateBuyerAction(
        buyerID,
        formattedValues,
        user,
        dispatch,
        controller
      );
      if (response?.status === 200) {
        dispatch(getBuyerAction(user.buyer_id));
        handleSuccess("Your details has been saved.", controller);
        formChangeRemove();
      } else {
        new Error(response);
      }
    } catch (error) {
      onPropagation(false, false, "");
      formChangeRemove();
      onHandleError(error, dispatch);
    } finally {
      dispatch(setSpinningAction(false));
    }
  };

  const formatValues = (values, buyer) => {
    const {
      property_type,
      occupancy_type,
      property_state,
      property_county,
      credit_score_range,
      units,
      ...newData
    } = values;

    return {
      ...newData,
      borrower_state_id: values.borrower_state.value,
      borrower_zip: parseInt(values.borrower_zip),
      credit_score_range_id: values.credit_score_range.value,
      debt_to_income_ratio: parseFloat(values.debt_to_income_ratio),
      default_downpayment_value: values.default_down_payment_value,
      first_time_home_buyers: JSON.parse(values.first_time_home_buyers),
      max_down_payment: parseFloat(values.max_down_payment),
      max_qualifying_payment: parseFloat(values.max_qualifying_payment),
      occupancy_type_id: values.occupancy_type.value,
      property_county_id: values.property_county.value,
      property_type_id: values.property_type.value,
      property_state_id: values.property_state.value,
      veterans_affairs: JSON.parse(values.veterans_affairs),
      agent_first_name: buyer.agent_first_name,
      agent_last_name: buyer.agent_last_name,
      agent_email: buyer.agent_email,
      unit_id: values.units.value,
      homeowners_insurance: parseFloat(values.homeowners_insurance),
      purchase_price: buyer.purchase_price,
    };
  };

  const checkBackAction = () => {
    if (isChange || isLoading) {
      return onPropagation(true, true, "/buyer");
    }
    router.push("/buyer");
  };

  const handlePropertyStateChange = (value) => {
    let stateKey = getKeyValue(states, value);

    dispatch(getCountiesPerStateAction(stateKey));
    form.setFieldsValue({ property_county: "" });
  };

  const getKeyValue = (items, value) => {
    let key = null;

    items.some((item) => {
      if (item.value === value) {
        key = item.key || item.id;
        return key;
      }
    });
    return key;
  };

  const handleSuccess = (message, controller) => {
    snackBar(message, "", "success");
    setTimeout(() => {
      controller.abort();
    }, 900);
  };

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

  const validateMessages = {
    required: "This field is required",
    types: {
      email: "invalid email",
      number: "invalid number",
    },
    number: {
      range: "input must be between ${min} and ${max}",
    },
  };

  const panelDescription = (
    <Row className="mt-3">
      <span className="text-base font-sharp-sans text-neutral-2">
        The sections below collect information about the types of properties
        you’re interested in, so we can share payment options that are specific
        to your needs.
      </span>
    </Row>
  );

  const emailModalHandler = (val) => {
    setShowEmailModal(val);
  };

  const collapseTheme = {
    inherit: false,
    token: {
      motionDurationSlow: "0s",
      motionDurationMid: "0s",
    },
  };

  return (
    <>
      <Row>
        <Col>
          <Link
            href={history.state.url}
            className="flex flex-row justify-start items-center gap-2 cursor-pointer text-neutral-1"
            onClick={(e) => checkBackAction(e)}
          >
            <ArrowLeftOutlined className="text-xanth mt-0.5 text-xl" />

            <span className="text-base font-semibold">Back</span>
          </Link>
        </Col>
      </Row>
      <div className="mt-0 pb-8">
        <div className="mx-auto w-full">
          <div className="flex justify-start items-start mt-7 mb-4">
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
              My Profile
            </h2>
          </div>
          <CustomDivider />
          <div className="text-base font-sharp-sans text-neutral-2">
            These are the parameters we’ve set for your pre-approval.
            <a
              onClick={emailModalHandler}
              className="text-denim font-sharp-sans-medium hover:underline"
            >
              {" Please contact me "}
            </a>
            to make any changes.
          </div>
          <div className="mt-12" id="_add-wrapper-listing_">
            <Form
              layout="vertical"
              form={form}
              className="mt-5"
              onFinish={handleFinish}
              validateMessages={validateMessages}
              onFieldsChange={(changedValue, _) => {
                for (const value of changedValue) {
                  if (value.touched) {
                    if (!isChange) {
                      onPropagation(true, false, "");
                    } else {
                      if (getChangeForm() === null) {
                        onPropagation(true, false, "");
                      }
                    }
                    break;
                  }
                }
              }}
            >
              <div id="_inputs-container_">
                <Row gutter={[0, 20]}>
                  <Col xs={24}>
                    <ConfigProvider theme={collapseTheme}>
                      <Collapse
                        defaultActiveKey={["1"]}
                        expandIconPosition="end"
                      >
                        <Panel
                          key="1"
                          header={
                            <div
                              style={{
                                marginBottom: -10,
                              }}
                            >
                              <span
                                className={`${
                                  isMobile ? "text-header-5" : "text-3xl"
                                } text-denim font-sharp-sans-bold`}
                              >
                                Contact Information
                              </span>
                            </div>
                          }
                        >
                          <Row gutter={[10, 0]} style={{ marginBottom: -20 }}>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Borrower First Name"
                                name="borrower_first_name"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter First Name"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Borrower Last Name"
                                name="borrower_last_name"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Last Name"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Borrower Email Address"
                                name="borrower_email"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Email Address"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Co-borrower First Name"
                                name="co_borrower_first_name"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter First Name"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Co-borrower Last Name"
                                name="co_borrower_last_name"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Last Name"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Co-borrower Email Address"
                                name="co_borrower_email"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Email Address"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={24} lg={24}>
                              <CustomFormItem
                                label="Current Home Address"
                                name="borrower_address"
                              >
                                <CustomTextArea
                                  type="text"
                                  placeholder="Enter Address"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem label="City" name="borrower_city">
                                <CustomInput
                                  type="text"
                                  placeholder="Enter City"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="State"
                                name="borrower_state"
                              >
                                <CustomSelect
                                  placeholder="Select State"
                                  options={states}
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem label="Zip" name="borrower_zip">
                                <CustomInput
                                  type="text"
                                  placeholder="Enter ZIP"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="Contact Number"
                                name="borrower_mobile_number"
                                required
                                rules={config.requiredRule}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Phone Number"
                                  onKeyDown={onMobileNumber}
                                  onChange={({ target }) =>
                                    validateMobileNumber(
                                      target.value,
                                      form,
                                      "borrower_mobile_number"
                                    )
                                  }
                                />
                              </CustomFormItem>
                            </Col>
                          </Row>
                        </Panel>
                      </Collapse>
                    </ConfigProvider>
                  </Col>
                  {panelDescription}
                  <Col xs={24}>
                    <ConfigProvider theme={collapseTheme}>
                      <Collapse
                        defaultActiveKey={["1"]}
                        expandIconPosition="end"
                      >
                        <Panel
                          key="1"
                          header={
                            <div
                              style={{
                                marginBottom: -10,
                              }}
                            >
                              <span
                                className={`${
                                  isMobile ? "text-header-5" : "text-3xl"
                                } text-denim font-sharp-sans-bold`}
                              >
                                Property Search Information
                              </span>
                            </div>
                          }
                        >
                          <Row gutter={[10, 0]} style={{ marginBottom: -20 }}>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Property Type"
                                name="property_type"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  placeholder="Select Property Type"
                                  options={propertyTypes.map((type) => {
                                    return {
                                      label: type.value,
                                      value: type.id,
                                    };
                                  })}
                                  disabled={!propertyTypes.length}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Occupancy Type"
                                name="occupancy_type"
                              >
                                <CustomSelect
                                  placeholder="Select Occupancy Type"
                                  options={occupancyTypes}
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Number of Units"
                                name="units"
                              >
                                <CustomSelect
                                  placeholder="Select Number of Units"
                                  options={numberOfUnits}
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="State"
                                name="property_state"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  placeholder="Select a State"
                                  options={states}
                                  disabled
                                  onChange={handlePropertyStateChange}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="County"
                                name="property_county"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  placeholder="Select a County"
                                  options={countyItems.map((item) => {
                                    return {
                                      label: item.label,
                                      value: item.key,
                                    };
                                  })}
                                  disabled={!countyItems.length}
                                  withsearch="true"
                                />
                              </CustomFormItem>
                            </Col>
                          </Row>
                        </Panel>
                      </Collapse>
                    </ConfigProvider>
                  </Col>
                  <Col xs={24}>
                    <ConfigProvider theme={collapseTheme}>
                      <Collapse
                        defaultActiveKey={["1"]}
                        expandIconPosition="end"
                      >
                        <Panel
                          key="1"
                          header={
                            <div
                              style={{
                                marginBottom: -10,
                              }}
                            >
                              <span
                                className={`${
                                  isMobile ? "text-header-5" : "text-3xl"
                                } text-denim font-sharp-sans-bold`}
                              >
                                Loan Information
                              </span>
                            </div>
                          }
                        >
                          <Row gutter={[10, 0]} style={{ marginBottom: -20 }}>
                            <Col xs={24} md={12} lg={10}>
                              <CustomFormItem
                                label="Desired Purchase Price"
                                name="purchase_price"
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Desired Price"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Max Down Payment Amt ($)"
                                name="max_down_payment"
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Down Payment Amt"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="VA Eligible"
                                name="veterans_affairs"
                                initialValue={false}
                              >
                                <Radio.Group
                                  disabled
                                  className="buyer"
                                  options={[
                                    {
                                      label: "Yes",
                                      value: true,
                                    },
                                    {
                                      label: "No",
                                      value: false,
                                    },
                                  ]}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={10}>
                              <CustomFormItem
                                label="Credit Score Range"
                                name="credit_score_range"
                              >
                                <CustomSelect
                                  placeholder="Select Credit Score Range"
                                  options={creditScoreRanges}
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Homeowners Insurance ($/month)"
                                name="homeowners_insurance"
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Homeowners Insurance"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="FTHB (First Time Home Buyer)"
                                name="first_time_home_buyers"
                                initialValue={false}
                              >
                                <Radio.Group
                                  disabled
                                  className="buyer"
                                  options={[
                                    {
                                      label: "Yes",
                                      value: true,
                                    },
                                    {
                                      label: "No",
                                      value: false,
                                    },
                                  ]}
                                ></Radio.Group>
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8} className="hidden">
                              <CustomFormItem
                                label="DTI"
                                name="debt_to_income_ratio"
                              >
                                <CustomInputNumber
                                  min={0}
                                  placeholder="Enter DTI"
                                  controls="true"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>

                            <Col xs={24} md={12} lg={10}>
                              <CustomFormItem
                                label="Max Qualifying Pmt (PITI + HOA Dues)"
                                name="max_qualifying_payment"
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Qualifying PMT"
                                  disabled
                                />
                              </CustomFormItem>
                            </Col>

                            <Col xs={24} md={12} lg={10} className="hidden">
                              <CustomFormItem
                                label="Default Down Payment"
                                name="default_down_payment_type"
                                required
                                initialValue={
                                  defaultDownPaymentUnit || "PERCENTAGE"
                                }
                                mb="0"
                                rules={[{ required: true }]}
                              >
                                <Radio.Group
                                  className="buyer"
                                  options={[
                                    {
                                      label: "Percentage (%)",
                                      value: "PERCENTAGE",
                                    },
                                    {
                                      label: "Dollars ($)",
                                      value: "DOLLAR",
                                    },
                                  ]}
                                  onChange={({ target }) => {
                                    setHasDownPaymentValue(false);
                                    setDefaultDownPaymentUnit(target.value);
                                    form.setFieldValue(
                                      "default_down_payment_value",
                                      target.value === "DOLLAR" ? "" : " "
                                    );
                                  }}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8} className="pt-4 hidden">
                              <CustomFormItem
                                label=""
                                name="default_down_payment_value"
                                rules={downPaymentRules}
                              >
                                <CustomInputNumber
                                  prefix={
                                    defaultDownPaymentUnit !== "PERCENTAGE" &&
                                    "$"
                                  }
                                  min={0}
                                  placeholder={
                                    defaultDownPaymentUnit !== "PERCENTAGE"
                                      ? "Enter Amount"
                                      : "Enter Percentage"
                                  }
                                  type={
                                    hasDownPaymentValue &&
                                    defaultDownPaymentUnit === "PERCENTAGE"
                                      ? "percent"
                                      : "currency"
                                  }
                                  onChange={(value) => {
                                    setHasDownPaymentValue(
                                      value ? true : false
                                    );
                                  }}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={10} className="mb-5">
                              <CustomFormItem
                                label="Self Employed"
                                name="self_employed"
                                initialValue={false}
                                mb="0"
                              >
                                <Radio.Group
                                  className="buyer"
                                  disabled
                                  options={[
                                    {
                                      label: "Yes",
                                      value: true,
                                    },
                                    {
                                      label: "No",
                                      value: false,
                                    },
                                  ]}
                                ></Radio.Group>
                              </CustomFormItem>
                            </Col>
                          </Row>
                        </Panel>
                      </Collapse>
                    </ConfigProvider>
                  </Col>
                </Row>
              </div>
              <div
                className="flex gap-4 flex-row-reverse items-center"
                style={{ marginTop: "35px" }}
              >
                <div>
                  <CustomButton
                    htmlType="submit"
                    disabled={isAppending || isLoading}
                    label={
                      isAppending || isLoading ? <LoadingOutlined /> : "Update"
                    }
                  />
                </div>
                <div>
                  <CustomHollowButton
                    onClick={(e) => checkBackAction(e)}
                    label="Cancel"
                  />
                </div>
              </div>
            </Form>
          </div>
        </div>
        <ConfirmProgressModal
          isShowModal={isModalOpen}
          isLoading={isLoading}
          handleBack={() => {
            onPropagation(false, false, "");
            handleReturnAction();
          }}
          handleCancel={() => {
            onPropagation(true, false, "");
          }}
        />
      </div>
      <SendEmailModal
        showModal={showEmailModal}
        modalHandler={emailModalHandler}
        isFromBuyerProfile
      />
    </>
  );
};

export default BuyerProfile;
