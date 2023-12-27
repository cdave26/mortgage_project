import React, { useEffect, useState } from "react";
import { Form, Radio, Col, Row, Grid } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import config from "~/config";
import {
  getQuickQuoteAction,
  getPublicQuickQuoteAction,
} from "~/store/quick-quote/action";
import {
  getCountiesPerStateAction,
  resetCountyAction,
} from "~/store/county/action";
import { setPubQuickQuoteStatesAction } from "~/store/publicstore/action";
import { onHandleError } from "~/error/onHandleError";
import downPaymentTypes from "~/enums/downPaymentTypes";
import { parseToDecimal } from "~/plugins/formatNumbers";

import CustomDivider from "../base/CustomDivider";
import CustomFormItem from "../base/CustomFormItem";
import CustomInputNumber from "../base/CustomInputNumber";
import RenderGetPaymentsResultContainer from "../base/OptimalBlue/GetPaymentResultContainer";
import EmptyOBResultsComponent from "../base/OptimalBlue/EmptyOBResultsComponent";
import LoadingOBResultsComponent from "../base/OptimalBlue/LoadingOBResultsComponent";
import UplistGetPaymentButton from "../base/buttons/UplistGetPaymentButton";
import CustomSelect from "../base/CustomSelect";
import CopyURLComponent from "../base/CopyURLComponent";
import buydown from "~/enums/buydown";

const QuickQuoteComponent = ({ url_identifier }) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;
  const isMobileXS = screens.sm === false;

  const [selectedTax, setSelectedTax] = useState("estimated");
  const [showLookup, setShowLookup] = useState(false);
  const [showRefinanceCashout, setShowRefinanceCashout] = useState(false);
  const [paymentResults, setPaymentResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [disableSellerCredit, setDisableSellerCredit] = useState(false);
  const [hasBuyDownSelected, setHasBuyDownSelected] = useState(false);

  const [pubQuickQuoteURL, setPubQuickQuoteURL] = useState({
    loading: false,
    url: null,
  });

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const {
    counties,
    loadingCounties,
    occupancyTypes,
    propertyTypes,
    creditScoreOptions,
    numberOfUnits,
    loadingNumberOfUnits,
    user,
    licenseStatesPerUserList,
    loadinglicenseStatesPerUser,
  } = useSelector((state) => {
    return {
      counties: state.counties.countiesPerState.data,
      loadingCounties: state.counties.countiesPerState.loading,
      occupancyTypes: state.occupancyType.items,
      propertyTypes: state.propertyType.items,
      creditScoreOptions: state.creditScoreRange.items,
      numberOfUnits: state.numberOfUnits.data,
      loadingNumberOfUnits: state.numberOfUnits.loading,
      user: state.auth?.data.user,
      licenseStatesPerUserList: state.licenses.licenseStatesPerUser.data,
      loadinglicenseStatesPerUser: state.licenses.licenseStatesPerUser.loading,
    };
  }, shallowEqual);

  useEffect(() => {
    if (user && Object.keys(user).length) {
      setPubQuickQuoteURL({ ...pubQuickQuoteURL, loading: true });
      const url = `${config?.appUrl}/${user?.company?.code}/quick-quote/${user?.nmls_num}-${user?.url_identifier}`;

      setTimeout(() => {
        setPubQuickQuoteURL({ ...pubQuickQuoteURL, url, loading: false });
      }, 2000);
    }
  }, [user]);

  useEffect(() => {
    if (
      occupancyTypes.length &&
      creditScoreOptions.length &&
      propertyTypes.length &&
      !loadingNumberOfUnits
    ) {
      form.setFields([
        {
          name: "occupancy",
          value: {
            label: "Primary Residence",
            value: "PrimaryResidence",
          },
        },
        {
          name: "credit_score",
          value: {
            label: "780 or higher",
            value: "780,850",
          },
        },
        {
          name: "property_type",
          value: {
            label: "Single Family",
            value: "SingleFamily",
          },
        },
        {
          name: "units_count",
          value: {
            label: "One Unit",
            value: "OneUnit",
          },
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
  }, [occupancyTypes, creditScoreOptions, propertyTypes, loadingNumberOfUnits]);

  const getLoanPurposeValue = (values) => {
    if (showRefinanceCashout) {
      if (values.is_refinance_cash_out) {
        return "RefiCashout";
      }

      return "RefiRateTermLimitedCO";
    }
    return "Purchase";
  };

  const scrollToBottom = (target) => {
    const targetElement = document.getElementById(target);
    targetElement.scrollIntoView({ behavior: "smooth" });
  };

  const getPropertyTax = (values) => {
    let propertyTax = values.property_taxes ?? 0;

    // check if from public quick quote
    if (url_identifier) {
      propertyTax =
        selectedTax === "actual"
          ? values.actual_tax ?? 0
          : values.estimated_tax ?? 0;
    }

    return parseFloat(propertyTax);
  };

  const handleFinish = async (values) => {
    if (url_identifier && selectedTax === "actual" && !values.actual_tax) {
      form.setFields([
        { name: "actual_tax", errors: [`This field is required.`] },
      ]);
      return;
    }

    setIsLoading(true);
    setHasResults(false);
    setSelectedState("");

    // for public quick quote
    if (url_identifier) {
      dispatch(
        setPubQuickQuoteStatesAction({
          hasResult: false,
          resultsData: {},
        })
      );
    }

    setTimeout(() => {
      scrollToBottom("ob-results");
    }, 0);

    const controller = new AbortController();
    const { signal } = controller;

    const selectedState = licenseStatesPerUserList.filter(
      (state) => state.value === values.state.value
    );

    const selectedCounty = counties.filter(
      (state) => state.value === values.county.value
    );

    if (selectedState.length) {
      const splitted = selectedState[0].value.split(" - ");
      setSelectedState(splitted[1]);
      // for public quick quote
      if (url_identifier) {
        dispatch(setPubQuickQuoteStatesAction({ selectedState: splitted[1] }));
      }
    }

    const payload = {
      ...values,
      credit_score: values.credit_score.value,
      occupancy: values.occupancy.value,
      property_type: values.property_type.value,
      units_count: values.units_count?.value ?? "OneUnit",
      state_id: selectedState[0].state_id,
      county_id: selectedCounty[0].key,
      loan_purpose: getLoanPurposeValue(values),
      heloc_loan_amount: values.heloc_loan_amount ?? 0,
      loan_amount: parseFloat(values.loan_amount),
      seller_credits: showRefinanceCashout ? 0 : values.seller_credits ?? 0,
      down_payment_type: downPaymentTypes.DOLLAR,
      property_taxes: getPropertyTax(values),
      buydown: values.buydown?.key ?? buydown.NONE,
    };

    try {
      let response;

      // for public quick quote
      if (url_identifier) {
        response = await getPublicQuickQuoteAction({
          body: {
            ...payload,
            url_identifier,
            down_payment: parseFloat(payload.down_payment),
          },
          signal,
        });
      } else {
        response = await getQuickQuoteAction({
          body: payload,
          signal,
        });
      }

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

        const checkMapped = !mapped.flat().length ? [] : mapped;

        setPaymentResults(checkMapped);
        setHasResults(true);

        // for public quick quote
        if (url_identifier) {
          dispatch(
            setPubQuickQuoteStatesAction({
              resultsData: { ...payload, results: checkMapped },
              hasResult: true,
            })
          );
        }
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      setTimeout(() => {
        scrollToBottom("ob-results");
      }, 500);
      controller.abort();
      setIsLoading(false);
    }
  };

  // might be used in future purposes
  const handleSellerCreditsChange = (val) => {
    // for public quick quote
    if (url_identifier) {
      dispatch(setPubQuickQuoteStatesAction({ sellerCredits: val }));
    }
  };

  const handleMortgageOptions = () => {
    setShowLookup(!showLookup);

    const renderOpacity = (idName, opacity) =>
      (document.getElementById(idName).style.opacity = opacity);

    const renderTranform = (idName, transform) =>
      (document.getElementById(idName).style.transform = transform);

    if (!showLookup) {
      renderTranform("icon-hover", "rotate(0deg) scale(1)");
      renderOpacity("icon-hover", 1);

      renderTranform("icon-default", "rotate(180deg) scale(0.5)");
      renderOpacity("icon-default", 0);
    } else {
      renderTranform("icon-default", "rotate(0deg) scale(1)");
      renderOpacity("icon-default", 1);

      renderTranform("icon-hover", "rotate(180deg) scale(0.5)");
      renderOpacity("icon-hover", 0);
    }
  };

  const handleStateChange = (value) => {
    const filtered = licenseStatesPerUserList.filter(
      (state) => state.value === value
    );
    if (!filtered.length) {
      form.resetFields(["county"]);
      resetCountyAction(dispatch);
      return;
    }

    // get Counties per state
    dispatch(getCountiesPerStateAction(filtered[0].state_id));

    form.setFields([{ name: "county", value: "" }]);
  };

  const checkPercentage = (val) => {
    val = isNaN(val) ? 0 : val;
    return Number.isInteger(val) ? val : parseToDecimal(val, 1);
  };

  const handlePubQuickQuoteCalculations = (formName) => {
    const { getFieldValue, setFieldValue } = form;
    const propertyValue = getFieldValue("property_value") ?? 0;
    let downPayment = 0;
    let downPaymentPercent = 0;
    let loanAmount = 0;
    let ltv = 0;

    const calculateBalancePercentage = (percent) => {
      const balance = 100 - percent;
      return checkPercentage(balance);
    };

    if (
      loanAmount > 99999999999 ||
      downPayment > 99999999999 ||
      propertyValue > 99999999999
    ) {
      form.resetFields([
        "loan_amount",
        "ltv",
        "down_payment",
        "down_payment_percent",
      ]);
    }

    if (formName === "property_value") {
      form.resetFields([
        "loan_amount",
        "ltv",
        "down_payment",
        "down_payment_percent",
      ]);
    }

    if (formName === "down_payment") {
      form.resetFields(["loan_amount", "ltv", "down_payment_percent"]);
      downPayment = getFieldValue("down_payment") ?? 0;

      if (downPayment > propertyValue) {
        const val = parseToDecimal(propertyValue, 0);
        downPayment = val;
        setFieldValue("down_payment", val);
      }

      downPaymentPercent = (downPayment / propertyValue) * 100;
      downPaymentPercent = checkPercentage(downPaymentPercent);
      loanAmount = propertyValue - downPayment;
      ltv = calculateBalancePercentage(downPaymentPercent);

      setFieldValue("down_payment_percent", downPaymentPercent);
      setFieldValue("loan_amount", parseToDecimal(loanAmount, 0));
      setFieldValue("ltv", ltv);
    }

    if (formName === "down_payment_percent") {
      form.resetFields(["loan_amount", "ltv", "down_payment"]);
      downPaymentPercent = getFieldValue("down_payment_percent") ?? 0;

      if (downPaymentPercent > 100) {
        downPaymentPercent = 100;
        setFieldValue("down_payment_percent", downPaymentPercent);
      }

      downPayment = (downPaymentPercent * propertyValue) / 100;
      loanAmount = propertyValue - downPayment;
      ltv = calculateBalancePercentage(downPaymentPercent);

      setFieldValue("down_payment", parseToDecimal(downPayment, 0));
      setFieldValue("loan_amount", parseToDecimal(loanAmount, 0));
      setFieldValue("ltv", ltv);
    }

    if (formName === "loan_amount") {
      form.resetFields(["ltv", "down_payment", "down_payment_percent"]);
      loanAmount = getFieldValue("loan_amount") ?? 0;

      if (loanAmount > propertyValue) {
        const val = parseToDecimal(propertyValue, 0);
        loanAmount = val;
        setFieldValue("loan_amount", val);
      }

      ltv = (loanAmount / propertyValue) * 100;
      ltv = checkPercentage(ltv);
      downPayment = propertyValue - loanAmount;
      downPaymentPercent = calculateBalancePercentage(ltv);

      setFieldValue("ltv", ltv);
      setFieldValue("down_payment", parseToDecimal(downPayment, 0));
      setFieldValue("down_payment_percent", downPaymentPercent);
    }

    if (formName === "ltv") {
      form.resetFields(["loan_amount", "down_payment", "down_payment_percent"]);
      ltv = getFieldValue("ltv") ?? 0;

      if (ltv > 100) {
        ltv = 100;
        setFieldValue("ltv", ltv);
      }

      loanAmount = (ltv * propertyValue) / 100;
      downPayment = propertyValue - loanAmount;
      downPaymentPercent = calculateBalancePercentage(ltv);

      setFieldValue("loan_amount", parseToDecimal(loanAmount, 0));
      setFieldValue("down_payment", parseToDecimal(downPayment, 0));
      setFieldValue("down_payment_percent", downPaymentPercent);
    }
  };

  const handleCalculations = (formName) => {
    const { getFieldValue, setFieldValue } = form;

    // source
    const propertyValue = getFieldValue("property_value") ?? 0;

    // for public quick quote
    if (url_identifier) {
      handlePubQuickQuoteCalculations(formName);
    } else {
      let loanAmount = getFieldValue("loan_amount") ?? 0;
      let ltv = getFieldValue("ltv") ?? 0;

      if (loanAmount > 99999999999 || propertyValue > 99999999999) {
        form.resetFields(["ltv"]);
      }

      if (formName === "loan_amount" || formName === "property_value") {
        form.resetFields(["ltv"]);

        if (loanAmount > propertyValue) {
          const val = parseToDecimal(propertyValue, 0);
          loanAmount = val;
          setFieldValue("loan_amount", val);
        }

        let value = (loanAmount / propertyValue) * 100;
        value = checkPercentage(value);

        setFieldValue("ltv", value);
      }

      if (formName === "ltv") {
        form.resetFields(["loan_amount"]);
        if (ltv > 100) {
          ltv = 100;
          setFieldValue("ltv", ltv);
        }

        const amount = (ltv * propertyValue) / 100;
        setFieldValue("loan_amount", parseToDecimal(amount, 0));
        setFieldValue("ltv", checkPercentage(ltv));
      }
    }
  };

  const calculateEstimatedTax = (value) => {
    let result = parseFloat((value * 0.01) / 12).toFixed(2);
    // check if value is more than 7 digits
    if (result > 9999999) {
      form.resetFields(["property_value"]);
      result = 0;
    }
    return result;
  };

  const renderOBResults = () => {
    if (isLoading) {
      return <LoadingOBResultsComponent />;
    }

    if (!isLoading && hasResults) {
      if (paymentResults.length) {
        return (
          <Row
            gutter={[20, 40]}
            className="flex justify-center mt-5 pb-10 mx-auto"
          >
            <RenderGetPaymentsResultContainer
              getPaymentResults={paymentResults}
              source="quick-quote"
            />
          </Row>
        );
      }

      return <EmptyOBResultsComponent />;
    }
  };

  const LoanPurposeComponent = () => {
    return (
      <>
        <div className="flex-1 w-full">
          <CustomFormItem
            label="Loan Purpose"
            name="loan_purpose"
            required
            rules={config.requiredRule.slice(0, 1)}
            initialValue={"Purchase"}
          >
            <Radio.Group
              options={[
                { label: "Purchase", value: "Purchase" },
                { label: "Refinance", value: "Refinance" },
              ]}
              optionType="button"
              buttonStyle="solid"
              className="w-full"
              onChange={(e) => {
                if (e.target.value !== "Refinance") {
                  setShowRefinanceCashout(false);
                  return;
                }
                form.setFieldValue("buydown", {
                  key: buydown.NONE,
                  label: "None",
                });
                setDisableSellerCredit(false);
                setHasBuyDownSelected(false);
                setShowRefinanceCashout(true);
              }}
            />
          </CustomFormItem>
        </div>
        <div className="flex-1 w-full">
          {showRefinanceCashout && (
            <CustomFormItem
              label="Refinance Cash Out?"
              name="is_refinance_cash_out"
              required
              rules={config.requiredRule.slice(0, 1)}
              initialValue={false}
            >
              <Radio.Group
                options={[
                  { label: "Yes", value: true },
                  { label: "No", value: false },
                ]}
                optionType="button"
                buttonStyle="solid"
                className="w-full"
              />
            </CustomFormItem>
          )}
        </div>
      </>
    );
  };

  const DownPaymentComponent = () => {
    return (
      <>
        <div className="md:flex-1 sm:w-full max-sm:flex-auto">
          <CustomFormItem
            label="Down Payment"
            name="down_payment"
            required
            rules={config.requiredRule.slice(0, 1)}
          >
            <CustomInputNumber
              type="currency"
              placeholder="100,000"
              prefix={"$"}
              onChange={() => handleCalculations("down_payment")}
              precision={0}
              min={0}
            />
          </CustomFormItem>
        </div>
        <div className="md:flex-1 md:w-full max-sm:flex-auto max-sm:w-4/12">
          <CustomFormItem
            label="% Down"
            name="down_payment_percent"
            required
            rules={config.requiredRule.slice(0, 1)}
          >
            <CustomInputNumber
              placeholder="20.0"
              suffix={"%"}
              onChange={() => handleCalculations("down_payment_percent")}
              precision={1}
              step={0.1}
              min={0}
            />
          </CustomFormItem>
        </div>
      </>
    );
  };

  const renderDownPayment = () => {
    if (isMobile || isMobileXS) {
      return (
        <div className="flex flex-row w-full gap-4">
          <DownPaymentComponent />
        </div>
      );
    }
    return <DownPaymentComponent />;
  };

  const showDownPaymentComponent = () => {
    if (url_identifier) {
      if (showRefinanceCashout) {
        return (
          <>
            <div className="md:flex-1 sm:w-full max-sm:flex-auto"></div>
            <div className="md:flex-1 sm:w-full max-sm:flex-auto"></div>
          </>
        );
      }
      return renderDownPayment();
    }

    return <LoanPurposeComponent />;
  };

  const getContainerClassName = () => {
    if (url_identifier) {
      if (hasResults) {
        return "";
      }
      return "pb-10";
    }

    return "pb-16";
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
    setDisableSellerCredit(true);
    setHasBuyDownSelected(true);
  };

  return (
    <div className={getContainerClassName()}>
      <Row className="flex justify-start items-start mb-3">
        <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
          Quick Quote
        </h2>
      </Row>
      <CustomDivider />
      {/** Prevent display on public quick quote*/}
      {!url_identifier && user?.nmls_num && (
        <Row>
          <Col span={24} className="mt-2 mb-5">
            <CopyURLComponent
              label="Public Quick Quote URL"
              url={pubQuickQuoteURL.url}
              isLoading={pubQuickQuoteURL.loading}
            />
          </Col>
        </Row>
      )}
      <div className="p-4 lg:p-8 border border-solid rounded-3xl border-alice-blue">
        <Form className="mt-5" form={form} onFinish={handleFinish}>
          {url_identifier && (
            <Row>
              <Col className="flex flex-col lg:flex-row justify-center items-center lg:gap-4 w-full">
                <LoanPurposeComponent />
                <div className="flex-1 w-full"></div>
              </Col>
            </Row>
          )}
          <Row>
            <Col className="flex flex-col lg:flex-row justify-center items-center lg:gap-4 w-full">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Home Value"
                  name="property_value"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    type="currency"
                    placeholder="500,000"
                    prefix={"$"}
                    onChange={(val) => {
                      handleCalculations("property_value");
                      // for public quick quote
                      if (url_identifier) {
                        form.setFieldsValue({
                          estimated_tax: calculateEstimatedTax(val),
                        });
                      }
                    }}
                    precision={0}
                    min={0}
                  />
                </CustomFormItem>
              </div>
              {showDownPaymentComponent()}
            </Col>
          </Row>

          <Row>
            <Col className="flex flex-col lg:flex-row justify-center items-center lg:gap-4 w-full">
              <div className="flex-1 w-full">
                <div className="flex flex-row justify-center items-center w-full gap-4">
                  <div className="md:flex-1 sm:w-full max-sm:flex-auto text-black">
                    <CustomFormItem
                      label="Loan Amount"
                      name="loan_amount"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      <CustomInputNumber
                        type="currency"
                        placeholder="400,000"
                        prefix={"$"}
                        onChange={() => handleCalculations("loan_amount")}
                        precision={0}
                        min={0}
                      />
                    </CustomFormItem>
                  </div>
                  <div className="md:flex-1 md:w-full max-sm:flex-auto max-sm:w-4/12">
                    <CustomFormItem
                      label="LTV"
                      name="ltv"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      <CustomInputNumber
                        placeholder="80.0"
                        suffix={"%"}
                        onChange={() => handleCalculations("ltv")}
                        precision={1}
                        step={0.1}
                        min={0}
                      />
                    </CustomFormItem>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Credit Score"
                  name="credit_score"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    options={creditScoreOptions}
                    disabled={!creditScoreOptions.length}
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
                    options={occupancyTypes}
                    disabled={!occupancyTypes.length}
                  />
                </CustomFormItem>
              </div>
            </Col>
          </Row>

          <Row>
            <Col className="flex flex-col lg:flex-row justify-center lg:items-center lg:gap-4 w-full">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Property Type"
                  name="property_type"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    options={propertyTypes}
                    disabled={!propertyTypes.length}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col lg:flex-row justify-center items-center lg:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="State"
                      name="state"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      <CustomSelect
                        options={licenseStatesPerUserList}
                        disabled={loadinglicenseStatesPerUser}
                        onChange={(opt) => handleStateChange(opt?.value)}
                        placeholder="Select State"
                        withsearch="true"
                        statesearch="true"
                      />
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="County"
                      name="county"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      <CustomSelect
                        options={counties}
                        disabled={loadingCounties}
                        placeholder="Select County"
                        withsearch="true"
                      />
                    </CustomFormItem>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <CustomFormItem
                  label="Military/Veteran?"
                  name="is_military_veteran"
                  required
                  rules={config.requiredRule.slice(1, 1)}
                  initialValue={false}
                >
                  <Radio.Group>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false}>No</Radio>
                  </Radio.Group>
                </CustomFormItem>
              </div>
            </Col>
          </Row>

          <Row>
            <Col className="flex flex-col lg:flex-row justify-center items-end lg:gap-4 w-full">
              <div className="flex-1 w-full">
                {/* check if from public quick quote */}
                {url_identifier ? (
                  <CustomFormItem
                    isbuyer
                    className="flex-grow"
                    label="Monthly Taxes"
                    name="property_taxes"
                    initialValue={"estimated"}
                    mb="0"
                    required
                  >
                    <Radio.Group
                      className="buyer flex-grow w-full"
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                      }}
                      onChange={(e) => {
                        setSelectedTax(e.target.value);
                      }}
                      value={selectedTax}
                    >
                      <Radio value={"actual"} className="buyer mx-0 w-full">
                        <CustomFormItem
                          label="Actual Taxes"
                          name={"actual_tax"}
                          rules={[{ type: "number", min: 0 }]}
                        >
                          <CustomInputNumber
                            prefix="$"
                            min={0}
                            placeholder={"0.00"}
                            onClick={() => {
                              form.setFieldValue("property_taxes", "actual");
                              setSelectedTax("actual");
                            }}
                            maxnumber={9999999} // 7 digits max
                          />
                        </CustomFormItem>
                      </Radio>
                      <Radio
                        value={"estimated"}
                        className="estimated-tax buyer m-0 w-full pl-1"
                      >
                        <CustomFormItem
                          label="Estimated Taxes"
                          name={"estimated_tax"}
                        >
                          <CustomInputNumber
                            className={
                              selectedTax === "estimated"
                                ? "selected-placeholder"
                                : "darker-placeholder"
                            }
                            prefix="$"
                            min={0}
                            placeholder={"0.00"}
                            disabled
                            maxnumber={9999999} // 7 digits max
                          />
                        </CustomFormItem>
                      </Radio>
                    </Radio.Group>
                  </CustomFormItem>
                ) : (
                  <CustomFormItem
                    label="Monthly Taxes"
                    name="property_taxes"
                    required
                    rules={config.requiredRule.slice(0, 1)}
                  >
                    <CustomInputNumber
                      type="currency"
                      prefix={"$"}
                      placeholder="0.00"
                      min={0}
                    />
                  </CustomFormItem>
                )}
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Homeowners Insurance ($/month)"
                  name="homeowners_insurance"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    type="currency"
                    prefix={"$"}
                    placeholder="Enter Homeowners Insurance"
                    min={0}
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="HOA Dues ($/month)"
                  name="hoa_dues"
                  initialValue={0}
                >
                  <CustomInputNumber
                    type="currency"
                    prefix={"$"}
                    placeholder="0.00"
                    min={0}
                  />
                </CustomFormItem>
              </div>
            </Col>
          </Row>
          {!showRefinanceCashout && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <CustomFormItem
                label="Seller Credit"
                name="seller_credits"
                initialValue={0}
                mb={"0"}
              >
                <CustomInputNumber
                  type="currency"
                  prefix={"$"}
                  precision={0}
                  min={0}
                  disabled={disableSellerCredit}
                />
              </CustomFormItem>
              <div className="buydown-dropdown">
                <CustomFormItem label="Buydown" name="buydown">
                  <CustomSelect
                    placeholder="Select Buydown"
                    options={buydownOptions()}
                    onChange={onChangeBuydownOption}
                  />
                </CustomFormItem>
              </div>
              {hasBuyDownSelected && (
                <div className="justify-self-center lg:col-span-3">
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
            </div>
          )}

          <Col>
            <div
              role="button"
              className="flex gap-2 cursor-pointer mortgage-button w-fit"
              onClick={handleMortgageOptions}
            >
              <div className="w-5">
                <PlusOutlined
                  id="icon-default"
                  className="text-xanth font-bold icon-default icons absolute top-0 bottom-0 block"
                  width={20}
                  height={20}
                  style={{ fontSize: "20px" }}
                />
                <MinusOutlined
                  id="icon-hover"
                  className="text-xanth font-bold icon-hover icons absolute top-0 bottom-0 block"
                  width={20}
                  height={20}
                  style={{ fontSize: "20px" }}
                />
              </div>
              <div className="text-neutral-1 font-sharp-sans-bold text-base">
                Advanced Search
              </div>
            </div>
          </Col>

          <Col
            className={`${
              showLookup ? "" : "hidden"
            } flex flex-col lg:flex-row justify-center items-center lg:gap-4 w-full mt-6`}
          >
            <div className="flex-1 w-full">
              <CustomFormItem label="No. of Units" name="units_count">
                <CustomSelect
                  options={numberOfUnits}
                  disabled={loadingNumberOfUnits}
                />
              </CustomFormItem>
            </div>

            <div className="flex-1 w-full">
              <CustomFormItem
                label="Second Mortgage Balance (If any)"
                name="heloc_loan_amount"
              >
                <CustomInputNumber
                  type="currency"
                  placeholder="100,000"
                  prefix={"$"}
                  min={0}
                />
              </CustomFormItem>
            </div>
            <div className="flex-1 w-full">
              <CustomFormItem
                label="First Time Home Buyer"
                name="is_first_time_buyer"
                initialValue={false}
              >
                <Radio.Group>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </CustomFormItem>
            </div>
            <div className="flex-1 w-full">
              <CustomFormItem
                label="Self-Employed"
                name="is_self_employed"
                initialValue={false}
              >
                <Radio.Group>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </CustomFormItem>
            </div>
          </Col>

          <Row className="w-full flex flex-col items-center justify-center mt-6">
            <UplistGetPaymentButton />
          </Row>
        </Form>
      </div>

      <div id="ob-results">{renderOBResults()}</div>

      {/** Prevent display on public quick quote*/}
      {!url_identifier && selectedState === "Utah" && (
        <div className="w-full pb-10 text-center">
          <p className="text-neutral-1 font-sharp-sans-semibold text-base flex-1 w-full mx-auto my-0 justify-center items-center">
            We are unable to provide information regarding this property for
            sale. Please contact a licensed real estate agent.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickQuoteComponent;
