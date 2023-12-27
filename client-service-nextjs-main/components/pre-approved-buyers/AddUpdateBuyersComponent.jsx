import React, { useEffect, useState } from "react";
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
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import CustomTextArea from "../base/CustomTextArea";
import {
  createBuyerAction,
  setInProgressAction,
  syncBuyerOBAction,
  updateBuyerAction,
} from "~/store/buyer/action";
import { onDispatchError, onHandleError } from "~/error/onHandleError";
import { LoadingOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { removeDecimal } from "~/plugins/formatNumbers";
import { getLoanOfficerAction } from "~/store/loanOfficer/action";
import {
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  setSpinningAction,
} from "~/store/ui/action";
import * as jose from "jose";
import config from "~/config";
import { validateMobileNumber } from "~/plugins/mobileNumber";
import { onMobileNumber } from "~/lib/events";
import CustomButton from "../base/CustomButton";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import checkMobileScreen from "~/plugins/checkMobileScreen";
import BackButton from "../base/buttons/BackButton";
import CustomSelect from "../base/CustomSelect";
import { BUYER } from "~/store/buyer/type";
import { get, isObject } from "lodash";
import userTypesEnum from "~/enums/userTypes";
import CopyURLComponent from "../base/CopyURLComponent";

const AddUpdateBuyer = ({ id: buyerID }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    user,
    userType,
    states,
    counties,
    buyer,
    isLoading,
    propertyTypes,
    occupancyTypes,
    creditScoreRanges,
    numberOfUnits,
    licensedStates,
    fetchingLicenseState,
    loginUrl,
    formChange: { isChange, isModalOpen, url },
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
        userType: auth.data.user?.user_type?.id,
        states: licenseStates.states.data,
        counties: counties.countiesPerState.data,
        buyer: buyer.buyerDetails,
        isLoading: buyer.isLoading,
        propertyTypes: propertyType.items,
        occupancyTypes: occupancyType.items,
        creditScoreRanges: creditScoreRange.items,
        numberOfUnits: numberOfUnits.data,
        licensedStates: loanOfficer.licensedStates,
        fetchingLicenseState: loanOfficer.isLoading,
        loginUrl: buyer.buyerDetails?.login_url,
        formChange: ui.formChange,
      };
    },
    shallowEqual
  );
  const isUpdate = window.location.href.split("/").pop() !== "add";
  const [countyItems, setCountyItems] = useState([]);
  const [firstRender, setFirstRender] = useState(true);
  const [syncClicked, setSyncClicked] = useState(false);
  const [isAppending, setIsAppending] = useState(true);
  const [defaultDownPaymentUnit, setDefaultDownPaymentUnit] = useState(
    !isUpdate && "PERCENTAGE"
  );
  const [hasDownPaymentValue, setHasDownPaymentValue] = useState(false);
  const [downPaymentRules, setDownPaymentRules] = useState([
    {
      required: true,
    },
  ]);

  const [form] = Form.useForm();
  const [OBForm] = Form.useForm();
  const { Panel } = Collapse;
  const token =
    typeof window !== "undefined" && window.localStorage.getItem("user");
  const decodedData = token && jose.decodeJwt(token);
  const retrieveStateID = (state) => {
    const stateName = state.slice(state.indexOf("-") + 2);
    const stateDetail = licensedStates.find(
      (state) => state.name === stateName
    );
    return stateDetail ? stateDetail.id : null;
  };

  const collapseTheme = {
    inherit: false,
    token: {
      motionDurationSlow: "0s",
      motionDurationMid: "0s",
    },
  };
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobileXS = screens.sm === false;
  const isTablet = screens.md === true;
  const isLaptop = screens.lg === true;
  const appendFullWidth = checkMobileScreen() ? { isfullwidth: true } : {};
  const showLoginUrl = userType === userTypesEnum.UPLIST_ADMIN;
  const [loanId, setLoanId] = useState(null);

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
    if (!isUpdate) {
      setIsAppending(false);
    }

    if ((isUpdate || syncClicked) && Object.keys(buyer).length) {
      const stateId = syncClicked
        ? retrieveStateID(buyer?.property_state?.full_state)
        : buyer.property_state.id;

      setDefaultDownPaymentUnit(buyer.default_down_payment_type);
      setIsAppending(false);

      form.setFieldsValue({
        ...buyer,
        borrower_state: mapSelected(buyer?.borrower_state?.id, states, "key"),
        borrower_zip: String(buyer?.borrower_zip || ""),
        purchase_price: buyer?.purchase_price || "",
        credit_score_range: mapSelected(
          buyer?.credit_score_range?.id,
          creditScoreRanges
        ),
        default_down_payment_value: parseFloat(
          removeDecimal(buyer?.default_down_payment_value || "")
        ),
        max_qualifying_payment: String(
          removeDecimal(buyer?.max_qualifying_payment || "")
        ),
        max_down_payment: String(removeDecimal(buyer?.max_down_payment || "")),
        occupancy_type: mapSelected(buyer?.occupancy_type?.id, occupancyTypes),
        property_type: mapSelected(buyer?.property_type?.id, propertyTypes),
        property_state: mapSelected(
          buyer?.property_state?.id,
          licensedStates,
          "value"
        ),
        property_county: mapSelected(
          buyer?.property_county?.id,
          counties,
          "value"
        ),
        units: mapSelected(buyer?.unit?.id, numberOfUnits, "value"),
        homeowners_insurance: buyer?.homeowners_insurance || "",
        first_time_home_buyers: buyer?.first_time_home_buyers || false,
        self_employed: buyer?.self_employed || false,
      });

      stateId && dispatch(getCountiesPerStateAction(stateId));
    }

    firstRender && dispatch(getLoanOfficerAction(decodedData.userData.id));
  }, [
    firstRender,
    buyer,
    states,
    syncClicked,
    propertyTypes,
    creditScoreRanges,
    occupancyTypes,
    licensedStates,
    numberOfUnits,
  ]);

  useEffect(() => {
    setCountyItems(counties);
    if ((isUpdate || syncClicked) && Object.keys(buyer).length) {
      form.setFieldsValue({
        property_county: mapSelected(
          buyer?.property_county?.id,
          counties,
          "key"
        ),
      });
    }
  }, [counties, buyer, syncClicked]);

  useEffect(() => {
    if (!firstRender && !fetchingLicenseState) {
      licensedStates.length === 0 &&
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: "No license added for the selected State",
            description: "Please add a license in My State Licenses page.",
            position: "topRight",
            type: "error",
          },
        });
    }
    setFirstRender(false);
  }, [firstRender, fetchingLicenseState]);

  useEffect(() => {
    setDownPaymentRules(
      defaultDownPaymentUnit === "PERCENTAGE"
        ? [
            {
              required: true,
              type: "number",
              min: 0,
              max: 99.99,
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

  const handleFinish = async (values) => {
    onPropagation(false, false, "");
    const formattedValues = formatValues(values);

    if (!isUpdate) {
      formattedValues.loan_id = loanId;
    }

    const controller = new AbortController();
    try {
      dispatch(setSpinningAction(true));
      const response = isUpdate
        ? await updateBuyerAction(
            buyerID,
            formattedValues,
            user,
            dispatch,
            controller
          )
        : await createBuyerAction(formattedValues, user, dispatch);
      if (response?.status === 200) {
        handleSuccess(response, controller);
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

  const formatValues = (values) => {
    const {
      property_type,
      occupancy_type,
      property_state,
      property_county,
      credit_score_range,
      units,
      borrower_state,
      ...newData
    } = values;
    return {
      ...newData,
      borrower_state_id: borrower_state.value,
      borrower_zip: parseInt(values.borrower_zip),
      credit_score_range_id: credit_score_range.value,
      purchase_price: parseFloat(values.purchase_price),
      debt_to_income_ratio: parseFloat(values.debt_to_income_ratio),
      default_downpayment_value: values.default_down_payment_value,
      first_time_home_buyers: JSON.parse(values.first_time_home_buyers),
      max_down_payment: parseFloat(values.max_down_payment),
      max_qualifying_payment: parseFloat(values.max_qualifying_payment),
      occupancy_type_id: occupancy_type.value,
      property_county_id: property_county.value,
      property_type_id: property_type.value,
      property_state_id: property_state.value,
      veterans_affairs: JSON.parse(values.veterans_affairs),
      unit_id: units.value,
      homeowners_insurance: values.homeowners_insurance
        ? parseFloat(values.homeowners_insurance)
        : 0,
    };
  };

  const handleReturnAction = () => {
    form.resetFields();

    if (url) {
      return (window.location.href = url);
    }

    router.push("/buyers");
  };

  const checkBackAction = () => {
    if (isChange || isLoading) {
      return onPropagation(true, true, "/buyers");
    }
    router.push("/buyers");
  };

  const handlePropertyStateChange = (value) => {
    if (value) {
      let stateKey = value.id;
      dispatch(getCountiesPerStateAction(stateKey));
      form.setFieldsValue({ property_county: "" });
    }
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

  const handleSuccess = (response, controller) => {
    const borrowerFullName = `${form.getFieldValue(
      "borrower_first_name"
    )} ${form.getFieldValue("borrower_last_name")}`;
    const header = isUpdate
      ? `${borrowerFullName} has been updated.`
      : `The buyer was created.`;
    const message = isUpdate
      ? null
      : `An email has been sent to ${borrowerFullName}.`;

    snackBar(header, message, "success");

    setTimeout(() => {
      window.location.href = "/buyers";
    }, 800);

    setInProgressAction(dispatch, false);

    setTimeout(() => {
      form.resetFields();
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

  const handleSyncOB = async (value) => {
    if (!value.loan_id) return;

    try {
      setSyncClicked(true);
      setLoanId(value.loan_id);
      await syncBuyerOBAction(value.loan_id, dispatch);
    } catch (error) {
      dispatch({
        type: BUYER.buyerDetails,
        payload: {
          isLoading: false,
          buyerDetails: {},
        },
      });

      const response = get(error, "response.data.message");

      !isObject(response)
        ? onDispatchError(dispatch, "Error", response)
        : onDispatchError(dispatch, response.title, response.message);

      setLoanId(null);
      form.resetFields();
    }
  };

  return (
    <div>
      <Row>
        <Col className="mb-9">
          <BackButton handleBack={checkBackAction} />
        </Col>
      </Row>
      <Row>
        <Col sm={24} md={24} lg={24}>
          <Row>
            <Col sm={24} md={showLoginUrl ? 13 : 12} lg={15}>
              <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-start mb-2">
                {isUpdate ? "Update" : "Add"} a Buyer
              </h2>
              <CustomDivider className="mb-6" />
            </Col>
            {!isUpdate ? (
              <Col sm={24} md={12} lg={9}>
                <Form
                  form={OBForm}
                  onFinish={handleSyncOB}
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
                  <Row gutter={[10, 0]}>
                    <Col sm={12} md={16} lg={14} xl={16} className="sm: px-0">
                      <CustomFormItem label="" name="loan_id">
                        <CustomInput
                          placeholder="Optimal Blue Loan ID"
                          style={{ marginTop: -20 }}
                        />
                      </CustomFormItem>
                    </Col>
                    <Col sm={12} md={8} lg={10} xl={8}>
                      <Button
                        htmlType="submit"
                        className="update-add-user flex justify-between justify-items-center items-center bg-xanth text-neutral-1 font-sharp-sans-semibold border-xanth pb-4 pt-4 px-6"
                        style={{
                          maxWidth: 104,
                          minWidth: 104,
                          width: 104,
                          height: 38,
                          marginTop: -9,
                        }}
                      >
                        {isLoading ? <LoadingOutlined /> : "Sync"}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Col>
            ) : (
              showLoginUrl && (
                <Col sm={24} md={11} lg={7}>
                  <CopyURLComponent
                    label={"Login URL"}
                    url={loginUrl}
                    isLoading={isAppending}
                    isbuyer
                  />
                </Col>
              )
            )}
          </Row>
          <div id="_add-wrapper-listing_">
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
                                  isMobileXS ? "text-header-5" : "text-3xl"
                                } text-denim font-sharp-sans-bold`}
                              >
                                Borrower's Information
                              </span>
                            </div>
                          }
                        >
                          <Row gutter={[10, 0]} style={{ marginBottom: -20 }}>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Borrower First Name"
                                name="borrower_first_name"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter First Name"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Borrower Last Name"
                                name="borrower_last_name"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Last Name"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Borrower Email Address"
                                name="borrower_email"
                                required
                                rules={[{ required: true, type: "email" }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Email Address"
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
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Co-borrower Email Address"
                                name="co_borrower_email"
                                rules={[{ type: "email" }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Email Address"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={24} lg={24}>
                              <CustomFormItem
                                label="Current Home Address"
                                name="borrower_address"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomTextArea
                                  type="text"
                                  placeholder="Enter Address"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="City"
                                name="borrower_city"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter City"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="State"
                                name="borrower_state"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  withsearch="true"
                                  placeholder="Select State"
                                  options={states.map((item) => {
                                    return {
                                      label: item.label,
                                      value: item.key,
                                    };
                                  })}
                                  disabled={!states.length}
                                  statesearch="true"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={6}>
                              <CustomFormItem
                                label="Zip"
                                name="borrower_zip"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter ZIP"
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
                                  isMobileXS ? "text-header-5" : "text-3xl"
                                } text-denim font-sharp-sans-bold`}
                              >
                                Real Estate Agent Information
                              </span>
                            </div>
                          }
                        >
                          <Row gutter={[10, 0]} style={{ marginBottom: -20 }}>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Agent First Name"
                                name="agent_first_name"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter First Name"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Agent Last Name"
                                name="agent_last_name"
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Last Name"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Agent Email Address"
                                name="agent_email"
                                rules={[{ type: "email" }]}
                              >
                                <CustomInput
                                  type="text"
                                  placeholder="Enter Email Address"
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
                                  isMobileXS ? "text-header-5" : "text-3xl"
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
                                  options={propertyTypes.map((type) => ({
                                    label: type.value,
                                    value: type.id,
                                  }))}
                                  disabled={!propertyTypes.length}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Occupancy Type"
                                name="occupancy_type"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  placeholder="Select Occupancy Type"
                                  options={occupancyTypes.map((type) => ({
                                    label: type.value,
                                    value: type.id,
                                  }))}
                                  disabled={!occupancyTypes.length}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={12} lg={8}>
                              <CustomFormItem
                                label="Number of Units"
                                name="units"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  placeholder="Select Number of Units"
                                  options={numberOfUnits}
                                  disabled={!numberOfUnits.length}
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
                                  withsearch="true"
                                  placeholder="Select State"
                                  options={licensedStates}
                                  disabled={!licensedStates.length}
                                  onChange={handlePropertyStateChange}
                                  statesearch="true"
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
                                  withsearch="true"
                                  placeholder="Select a County"
                                  options={countyItems.map((item) => {
                                    return {
                                      label: item.label,
                                      value: item.key,
                                    };
                                  })}
                                  disabled={
                                    !licensedStates.length ||
                                    !countyItems.length
                                  }
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
                                  isMobileXS ? "text-header-5" : "text-3xl"
                                } text-denim font-sharp-sans-bold`}
                              >
                                Loan Information
                              </span>
                            </div>
                          }
                        >
                          <Row gutter={[10, 0]} style={{ marginBottom: -20 }}>
                            <Col xs={24} md={9} lg={9}>
                              <CustomFormItem
                                label="Desired Purchase Price"
                                name="purchase_price"
                                required
                                rules={[
                                  {
                                    required: true,
                                  },
                                ]}
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Desired Price"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={9} lg={9}>
                              <CustomFormItem
                                label="Max Down Payment Amt ($)"
                                name="max_down_payment"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Down Payment Amt"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={6} lg={6}>
                              <CustomFormItem
                                label="VA Eligible"
                                name="veterans_affairs"
                                required
                                initialValue={false}
                                rules={[{ required: true }]}
                              >
                                <Radio.Group
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

                            <Col xs={24} md={9} lg={9}>
                              <CustomFormItem
                                label="Credit Score Range"
                                name="credit_score_range"
                                required
                                rules={[{ required: true }]}
                              >
                                <CustomSelect
                                  placeholder="Select Credit Score Range"
                                  options={creditScoreRanges.map((type) => ({
                                    label: type.value,
                                    value: type.id,
                                  }))}
                                  disabled={!creditScoreRanges.length}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={9} lg={9}>
                              <CustomFormItem
                                label="DTI"
                                name="debt_to_income_ratio"
                                required
                                additionalInfo={"Debt To Income Ratio"}
                                rules={[
                                  {
                                    required: true,
                                    type: "number",
                                    min: 0,
                                    max: 99.99,
                                  },
                                ]}
                              >
                                <CustomInputNumber
                                  min={0}
                                  placeholder="Enter DTI"
                                  controls="true"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={6} lg={6}>
                              <CustomFormItem
                                label={`FTHB ${
                                  !isTablet || isLaptop
                                    ? "(First Time Home Buyer)"
                                    : ""
                                }`}
                                name="first_time_home_buyers"
                                required
                                initialValue={false}
                                rules={[{ required: true }]}
                                {...(!isMobileXS && !isLaptop
                                  ? { additionalInfo: "First Time Home Buyer" }
                                  : {})}
                              >
                                <Radio.Group
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
                            <Col
                              xs={24}
                              md={24}
                              lg={9}
                              className={isMobileXS ? "mt-3" : "mt-0"}
                            >
                              <CustomFormItem
                                label="Max Qualifying Pmt (PITI + HOA Dues)"
                                name="max_qualifying_payment"
                                rules={[{ required: true }]}
                                required
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Qualifying PMT"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={18} lg={9}>
                              <CustomFormItem
                                label="Default Down Payment"
                                name="default_down_payment_value"
                                rules={downPaymentRules}
                                required
                                mb={isLaptop ? "6" : "0"}
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
                                  {...(defaultDownPaymentUnit === "PERCENTAGE"
                                    ? { precision: 1 }
                                    : {})}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col
                              xs={24}
                              md={6}
                              lg={6}
                              className={isTablet ? "pt-[15px]" : ""}
                            >
                              <CustomFormItem
                                label=""
                                name="default_down_payment_type"
                                initialValue={
                                  defaultDownPaymentUnit || "PERCENTAGE"
                                }
                                rules={[{ required: true }]}
                              >
                                <Radio.Group
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
                                      ""
                                    );
                                  }}
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={18} lg={9}>
                              <CustomFormItem
                                label="Homeowners Insurance ($/month)"
                                name="homeowners_insurance"
                              >
                                <CustomInputNumber
                                  prefix={"$"}
                                  min={0}
                                  placeholder="Enter Homeowners Insurance"
                                />
                              </CustomFormItem>
                            </Col>
                            <Col xs={24} md={6} lg={9} className="xs: mb-3">
                              <CustomFormItem
                                label="Self Employed"
                                name="self_employed"
                                required
                                initialValue={false}
                                rules={[{ required: true }]}
                              >
                                <Radio.Group
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
                          </Row>
                        </Panel>
                      </Collapse>
                    </ConfigProvider>
                  </Col>
                </Row>
              </div>

              <div className="w-full flex flex-col md:flex-row-reverse mt-6 pb-16 gap-3">
                <div>
                  <CustomButton
                    {...appendFullWidth}
                    htmlType="submit"
                    disabled={
                      isAppending || isLoading || (isUpdate && !counties.length)
                    }
                    label={
                      isAppending ||
                      isLoading ||
                      (isUpdate && !counties.length) ? (
                        <LoadingOutlined />
                      ) : isUpdate ? (
                        "Update"
                      ) : (
                        "Send Invite"
                      )
                    }
                  />
                </div>
                <div>
                  <CustomHollowButton
                    {...appendFullWidth}
                    onClick={(e) => checkBackAction(e)}
                    label="Cancel"
                  />
                </div>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
      <ConfirmProgressModal
        isShowModal={isModalOpen}
        isLoading={isLoading}
        handleBack={() => {
          formChangeRemove();
          onPropagation(false, false, "");
          handleReturnAction();
        }}
        handleCancel={() => {
          onPropagation(true, false, "");
        }}
      />
    </div>
  );
};

export default AddUpdateBuyer;
