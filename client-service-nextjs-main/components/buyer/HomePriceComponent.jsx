import React, { Fragment, useContext, useEffect, useState } from "react";
import {
  Form,
  Col,
  Row,
  Button,
  Radio,
  Modal,
  Grid,
  Collapse,
  Popover,
  Switch,
  ConfigProvider,
  Space,
} from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  LoadingOutlined,
  DownOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import CustomFormItem from "../base/CustomFormItem";
import CustomInputNumber from "../base/CustomInputNumber";
import CustomButton from "../base/CustomButton";
import {
  requestPaymentAction,
  setRequestPaymentAction,
} from "~/store/buyersPreApproval/action";
import { onHandleError } from "~/error/onHandleError";
import CustomDivider from "../base/CustomDivider";
import CustomInput from "../base/CustomInput";
import CustomTextArea from "../base/CustomTextArea";
import { getCountiesPerStateAction } from "~/store/county/action";
import { addCommas, removeNonIntegers } from "~/plugins/formatNumbers";
import DisclosureAndAssumptionsComponent from "../disclosureAndAssumptions/DisclosureAndAssumptionsComponent";
import { getLoanOfficerAction } from "~/store/loanOfficer/action";
import { setSpinningAction } from "~/store/ui/action";
import SendEmailModal from "./SendEmailModal";
import UplistGetPaymentButton from "../base/buttons/UplistGetPaymentButton";
import LoadingOBResultsComponent from "../base/OptimalBlue/LoadingOBResultsComponent";
import { collapseTheme, customButtonTheme, switchTheme } from "./themes/theme";
import { condoTypes } from "~/utils/listing";
import { HomePriceContext } from "~/utils/context";
import CustomSelect from "../base/CustomSelect";
import config from "~/config";

const HomePrice = () => {
  const [form] = Form.useForm();
  const [modalForm] = Form.useForm();
  const dispatch = useDispatch();
  const [formSellerCredit, setFormSellerCredit] = useState();
  const [showModal, setShowModal] = useState();
  const [homePriceValues, setHomePriceValues] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({});
  const [paymentValues, setPaymentValues] = useState(null);
  const [stateDisclosure, setStateDisclosure] = useState(null);
  const [companyStateLicense, setCompanyStateLicense] = useState(null);
  const [stateMetaData, setStateMetaData] = useState([null]);
  const [stateName, setStateName] = useState(null);
  const [userStateLicense, setUserStateLicense] = useState(null);
  const [hasPayments, setHasPayments] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isDollarType, setIsDollarType] = useState(true);
  const [switchToggled, setSwitchToggled] = useState(false);
  const [selectedTax, setSelectedTax] = useState("estimated");
  const [propertyType, setPropertyType] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCondo, setIsCondo] = useState(false);
  const [maxPITI, setMaxPITI] = useState(0);
  const [downPayment, setDownPayment] = useState(0);
  const [showWarningMessage, setShowWarningMessage] = useState(false);
  const { useBreakpoint } = Grid;
  const { Panel } = Collapse;
  const screens = useBreakpoint();
  const isXsOrSm = screens.xs || screens.sm;
  const isNotMd = !screens.md;
  const shouldApplyWidth = !isXsOrSm && isNotMd;
  const isMobile = screens.lg === false;
  const isMobileXS = screens.sm === false;
  const isLaptop = screens.lg === true;
  const showSellerCredit = formSellerCredit > 0;
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const { stateSetter } = useContext(HomePriceContext);

  const {
    user,
    propertyTypes,
    occupancyTypes,
    creditScoreRanges,
    isLoading,
    payments,
    errorMessage,
    buyer,
    counties,
    loanOfficer,
    licensedStates,
  } = useSelector(
    ({
      auth,
      propertyType,
      occupancyType,
      creditScoreRange,
      buyersPreApproval,
      buyer,
      counties,
      loanOfficer,
    }) => {
      return {
        user: auth.data.user,
        propertyTypes: propertyType.items,
        occupancyTypes: occupancyType.items,
        creditScoreRanges: creditScoreRange.items,
        isLoading: buyersPreApproval.isLoading,
        payments: buyersPreApproval.payments,
        errorMessage: buyersPreApproval.errorMessage,
        buyer: buyer.buyerDetails,
        counties: counties.countiesPerState.data,
        loanOfficer: loanOfficer.loanOfficerDetails,
        licensedStates: loanOfficer.licensedStates,
      };
    },
    shallowEqual
  );
  const officerFullName = `${loanOfficer?.first_name || ""} ${
    loanOfficer?.last_name || ""
  }`;
  const officerJobTitle = loanOfficer?.job_title || "";
  const officerNMLS = loanOfficer?.nmls_num || "";
  const officerContactNum = loanOfficer?.mobile_number || "";
  const officerEmail = loanOfficer?.email || "";
  const equalHousingDetail = loanOfficer?.company?.equal_housing || "";

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
      const buyerDownPayment = parseFloat(buyer.max_down_payment);
      setPropertyType(buyer.property_type.id);
      setDownPayment(buyerDownPayment);

      form.setFieldsValue({
        price: parseFloat(buyer.purchase_price),
        down_payment: parseFloat(buyer.default_down_payment_value),
        property_type_id: mapSelected(
          buyer?.property_type?.id,
          propertyTypes,
          "value"
        ),
        occupancy_type_id: mapSelected(
          buyer.occupancy_type.id,
          occupancyTypes,
          "value"
        ),
        loan_amount: calculateLoanAmout(
          buyer.purchase_price,
          buyer.default_down_payment_value,
          buyer.default_down_payment_type
        ),
        estimated_tax: calculateEstimatedTax(buyer.purchase_price),
        credit_score_range_id: mapSelected(
          buyer.credit_score_range.id,
          creditScoreRanges,
          "value"
        ),
        debt_to_income_ratio: buyer.debt_to_income_ratio,
        veterans_affairs: buyer.veterans_affairs ? 1 : 0,
        first_time_home_buyers: buyer.first_time_home_buyers ? 1 : 0,
        insurance: parseFloat(buyer.homeowners_insurance),
      });
      setIsCondo(condoTypes.includes(buyer.property_type.id));
      setMaxPITI(parseFloat(buyer.max_qualifying_payment));
      dispatch(getCountiesPerStateAction(buyer.property_state.id));
      dispatch(getLoanOfficerAction(buyer.loan_officer.id));
    }
  }, [buyer, occupancyTypes, propertyTypes, creditScoreRanges]);

  useEffect(() => {
    if (Object.keys(buyer).length && Object.keys(loanOfficer).length) {
      stateSetter({ buyerData: { buyer, loanOfficer } });
    }
  }, [buyer, loanOfficer]);

  useEffect(() => {
    if (payments && Object.keys(payments).length > 0) {
      const reorderedPayments = payments["Conforming"]
        ? { Conforming: payments["Conforming"], ...payments }
        : payments;
      const paymentItems = Object.keys(payments).length;
      setShowWarningMessage(
        errorMessage?.includes("max down payment")
          ? true
          : isAnyTotalPaymentAboveLimit(payments, maxPITI)
      );
      setHasPayments(true);
      setPaymentValues(
        Object.keys(reorderedPayments).map((key) => {
          const {
            veterans_affairs_approved,
            first_time_home_buyers_approved,
            property_type_id,
          } = form.getFieldsValue();

          if (
            property_type_id === "Condo" &&
            ((!veterans_affairs_approved && key === "VA") ||
              (!first_time_home_buyers_approved && key === "FHA"))
          ) {
            return;
          }

          const item = key === "NonConforming" ? "Jumbo" : key;
          const title = `${item} 30 Year Fixed`;
          const information = " "; // TODO: placeholder must be replaced in the future
          const searchId = payments[key]?.search_id || "";
          const quoteNumber = payments[key]?.quote_number || "";
          const data = populateComputations(key, payments[key]);
          return generateCalculationDetails(
            key,
            title,
            information,
            searchId,
            quoteNumber,
            data,
            paymentItems
          );
        })
      );
    } else {
      setShowWarningMessage(true);
    }
  }, [payments, errorMessage]);

  useEffect(() => {
    if (Object.keys(buyer).length && licensedStates.length) {
      const propertyStateId = buyer.property_state.id;
      const license = licensedStates.find(
        (state) => state.id === propertyStateId
      );

      modalForm.setFieldsValue({
        state: mapSelected(buyer.property_state.id, licensedStates, "value"),
      });

      setStateName(license?.name || "");
      setStateDisclosure(license?.disclosure || "");
      setStateMetaData(JSON.stringify(license?.metadata) || "[]");
      setCompanyStateLicense(license?.license || "");
      setUserStateLicense(license?.userStateLicense || "");
      setIsDollarType(buyer?.default_down_payment_type === "DOLLAR");
      dispatch(setSpinningAction(false));
    }
  }, [buyer, licensedStates]);

  useEffect(() => {
    if (Object.keys(buyer).length && counties.length) {
      form.setFieldsValue({
        buyer_county: mapSelected(buyer.property_county.id, counties, "key"),
      });
      modalForm.setFieldsValue({
        county: mapSelected(buyer.property_county.id, counties, "key"),
      });
    }
  }, [buyer, counties]);

  const onHandleFinish = async (values) => {
    setHasPayments(false);
    setShowWarningMessage(false);
    const {
      homeowners_association_fee = 0,
      seller_credit = 0,
      actual_tax = 0,
      estimated_tax = 0,
      property_type,
      occupancy_type_id,
      credit_score_range_id,
      first_time_home_buyers,
      insurance,
      veterans_affairs,
      first_time_home_buyers_approved,
      veterans_affairs_approved,
      property_type_id,
      buyer_county,
      ...otherValues
    } = values;

    const modifiedValues = {
      ...otherValues,
      down_payment_type: isDollarType ? "DOLLAR" : "PERCENTAGE",
      homeowners_association_fee,
      seller_credit,
      tax: selectedTax === "actual" ? actual_tax : estimated_tax,
      occupancy_type_id: !showAdvanced
        ? buyer.occupancy_type.id
        : occupancy_type_id.value,
      credit_score_range_id: !showAdvanced
        ? buyer.credit_score_range.id
        : credit_score_range_id.value,
      first_time_home_buyers: buyer.first_time_home_buyers ? 1 : 0,
      insurance: !showAdvanced
        ? parseFloat(buyer.homeowners_insurance)
        : insurance,
      veterans_affairs: !showAdvanced
        ? buyer.veterans_affairs
          ? 1
          : 0
        : isCondo
        ? veterans_affairs_approved
        : veterans_affairs,
      first_time_home_buyers_approved: showAdvanced
        ? isCondo
          ? first_time_home_buyers_approved
          : 1
        : 1,
      veterans_affairs_approved: !showAdvanced
        ? buyer.veterans_affairs
          ? 1
          : 0
        : isCondo
        ? veterans_affairs_approved
        : veterans_affairs,
      property_type_id: !showAdvanced
        ? buyer.property_type.id
        : property_type_id.value,
      county_id: showAdvanced
        ? buyer_county.key ?? buyer_county.value
        : buyer.property_county.id,
    };

    setHomePriceValues(modifiedValues);
    setIsCondo(condoTypes.includes(modifiedValues.property_type_id));

    try {
      const response = await requestPaymentAction(
        modifiedValues,
        user,
        dispatch
      );
      if (response?.status === 200) {
        setPaymentDetails(response.data.payments);
      }
    } catch (error) {
      onHandleError(error, dispatch);
    } finally {
      setTimeout(() => {
        scrollToBottom("home-price-calculation");
      }, 500);
    }
  };

  const formatNumber = (value) => {
    const initialNumber = parseFloat(value);
    const number =
      initialNumber === 0
        ? "0.00"
        : initialNumber &&
          initialNumber.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
    return number;
  };

  const getId = (value, options) => {
    let item = options.find(
      (item) => item.value === value || item.label === value
    );

    return item ? (item.id ? item.id : item.value) : value;
  };

  const isAnyTotalPaymentAboveLimit = (paymentData, threshold) => {
    let count = 0;
    for (const key in paymentData) {
      if (
        paymentData.hasOwnProperty(key) &&
        paymentData[key].total_payment +
          paymentData[key].homeowners_association_fee >
          threshold
      ) {
        count++;
        if (count === Object.keys(paymentData).length) {
          return true;
        }
      }
    }
    return false;
  };

  const calculatePercentage = (
    value,
    downPaymentValue = buyer?.default_down_payment_value
  ) => {
    const percentageValue = downPaymentValue || 0;
    const result = (value * percentageValue) / 100;
    return result;
  };

  const calculateLoanAmout = (price, downPayment, downPaymentType) => {
    if (downPaymentType === "PERCENTAGE") {
      return roundValues(price - calculatePercentage(price, downPayment));
    } else {
      return roundValues(price - downPayment);
    }
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

  const defaultNumberRule = [
    {
      type: "number",
      min: 0,
    },
  ];

  const defaultRule = [
    {
      required: true,
    },
  ];

  const booleanOptions = [
    {
      label: "Yes",
      value: 1,
    },
    {
      label: "No",
      value: 0,
    },
  ];

  const roundValues = (val) => {
    return Math.round(val);
  };

  const calculateEstimatedTax = (value) => {
    return parseFloat((value * 0.01) / 12).toFixed(2);
  };

  const inputDetails = [
    {
      label: "Purchase Price".toUpperCase(),
      name: "price",
      rules: [{ ...defaultNumberRule[0], ...defaultRule[0] }],
      type: "number",
      handler: (value) => {
        let downPaymentValue = form?.getFieldValue("down_payment") || null;
        if (!isDollarType) {
          downPaymentValue = calculateLoanAmout(
            value,
            downPaymentValue,
            "PERCENTAGE"
          );
        } else {
          downPaymentValue = calculateLoanAmout(
            value,
            downPaymentValue,
            "DOLLAR"
          );
        }
        downPaymentValue &&
          form.setFieldsValue({
            loan_amount: downPaymentValue,
            estimated_tax: calculateEstimatedTax(value),
          });
      },
    },
    {
      label: "Down Payment".toUpperCase(),
      name: "down_payment",
      rules: [{ ...defaultNumberRule[0], ...defaultRule[0] }],
      type: "number",
      handler: (value) => {
        const priceValue = form.getFieldValue("price");
        let downPaymentValue = value;
        let loanAmountValue = null;

        if (isDollarType) {
          if (priceValue <= downPaymentValue) {
            downPaymentValue = priceValue;
            form.setFieldValue("down_payment", downPaymentValue);
          }
          loanAmountValue = priceValue - downPaymentValue;
        } else {
          const downpaymentPercentValue = priceValue * (downPaymentValue / 100);
          loanAmountValue = priceValue - downpaymentPercentValue;
        }

        priceValue &&
          form.setFieldValue("loan_amount", roundValues(loanAmountValue));
      },
    },
    {
      label: "Loan Amount".toUpperCase(),
      name: "loan_amount",
      rules: [{ ...defaultNumberRule[0], ...defaultRule[0] }],
      type: "number",
      handler: (value) => {
        const priceValue = form.getFieldValue("price");
        let loanAmountValue = value;
        let downPaymentValue = null;

        if (priceValue <= value) {
          loanAmountValue = priceValue;
          form.setFieldValue("loan_amount", loanAmountValue);
        }

        if (priceValue) {
          !downPaymentValue && isDollarType
            ? (downPaymentValue = priceValue - loanAmountValue)
            : (downPaymentValue = parseFloat(
                ((priceValue - loanAmountValue) / priceValue) * 100
              ));
          form.setFieldValue("down_payment", roundValues(downPaymentValue));
        }
      },
    },
    {
      label: "Taxes".toUpperCase(),
      name: "tax",
      rules: defaultNumberRule,
      type: "number",
    },
    {
      label: "HOA Dues ($/month)".toUpperCase(),
      name: "homeowners_association_fee",
      rules: defaultNumberRule,
      type: "number",
    },
    {
      label: "Seller Credit".toUpperCase(),
      name: "seller_credit",
      rules: defaultNumberRule,
      type: "number",
      handler: (value) => {
        setFormSellerCredit(value && value.toFixed(2));
      },
    },
    {
      label: "Debt Ratio".toUpperCase(),
      name: "debt_to_income_ratio",
      placeholder: "0.00",
      rules: [
        {
          ...defaultNumberRule[0],
          max: 99.99,
        },
      ],
      options: null,
      type: "input",
    },
  ];

  const advancedSearchDetails = [
    {
      label: "Property Type".toUpperCase(),
      name: "property_type_id",
      rules: defaultRule,
      options: propertyTypes,
      placeholder: "Select Property Type",
      type: "selector",
      handler: (opt) => {
        const flag = condoTypes.includes(opt?.value)
        setPropertyType(opt?.value)
        setIsCondo(flag)
        form.setFieldValue('first_time_home_buyers_approved', flag ? 0 : 1)
        form.setFieldValue('veterans_affairs_approved', flag ? 0 : 1)
      },
    },
    {
      label: "County".toUpperCase(),
      name: "buyer_county",
      rules: defaultRule,
      options: counties,
      placeholder: "Select County",
      type: "selector",
      withsearch: "true",
    },
    {
      label: "Occupancy".toUpperCase(),
      name: "occupancy_type_id",
      rules: defaultRule,
      options: occupancyTypes,
      placeholder: "Select Occupancy",
      type: "selector",
    },
    {
      label: "Credit Score Range".toUpperCase(),
      name: "credit_score_range_id",
      rules: defaultRule,
      options: creditScoreRanges,
      placeholder: "780 or higher",
      type: "selector",
    },
    {
      label: "Homeowners Insurance ($/month)".toUpperCase(),
      name: "insurance",
      rules: [{ ...defaultNumberRule[0], ...defaultRule[0] }],
      type: "number",
    },
  ];

  const populateComputations = (key, data) => {
    const mortgageInsurance = {
      label: "MI",
      value: `$${formatNumber(data?.mortgage_insurance)}`,
    };

    const computations = [
      {
        label: "Rate / APR",
        value: `${data?.interest_rate.toFixed(
          3
        )}% / ${data?.annual_percentage_rate.toFixed(3)}%`,
      },
      {
        label: "Monthly P&I",
        value: `$${formatNumber(data?.monthly_principal_interest)}`,
      },
      {
        label: "Taxes",
        value: `$${formatNumber(data?.tax)}`,
      },
      { label: "Insurance", value: `$${formatNumber(data?.insurance)}` },
      {
        label: "Total PMT",
        value: `$${formatNumber(data?.total_payment)}`,
        isPayment: true,
      },
      {
        label: "HOA Dues",
        value: `$${formatNumber(data?.homeowners_association_fee)}`,
      },
    ];

    const totalPmtIndex = computations.findIndex(
      (item) => item.label === "Total PMT"
    );

    if (key !== "VA") {
      data?.mortgage_insurance !== 0 &&
        computations.splice(totalPmtIndex, 0, mortgageInsurance);
    }

    return computations;
  };

  const handleGenerators = (key, detail) => {
    switch (detail.type) {
      case "number":
        return generateInputNumber(key, detail);
      case "selector":
        return generateSelector(key, detail);
      case "input":
        return generateInput(key, detail);
      case "radio":
        return generateRadioGroup(key, detail);
      default:
        break;
    }
  };

  const handleTypeChange = (value) => {
    setIsDollarType(value);
    setSwitchToggled(true);
    form.setFieldValue("down_payment", "");
  };

  const handleTaxChange = ({ target }) => {
    setSelectedTax(target.value);
  };

  const generateInputNumber = (key, { label, name, rules, handler }) => {
    const isSellerCredit = name === "seller_credit";
    const isWholeNumber = ["seller_credit", "price", "loan_amount"].includes(
      name
    );
    const isHOADues = name === "homeowners_association_fee";
    const isLoanAmountMobile = isMobile && name === "loan_amount";

    switch (name) {
      case "down_payment": {
        return (
          <Col key={key} xs={24} md={12} lg={8} style={{ marginBottom: -5 }}>
            <Row gutter={[5, 0]}>
              <Col xs={19} md={20} lg={19} style={{ marginBottom: -5 }}>
                <CustomFormItem
                  label={label}
                  name={name}
                  required={rules && rules[0]?.required}
                  rules={rules}
                  isbuyer
                >
                  <CustomInputNumber
                    isbuyer
                    prefix={isDollarType && "$"}
                    min={0}
                    placeholder={
                      switchToggled
                        ? isDollarType
                          ? "Enter Amount"
                          : "Enter Percentage"
                        : "0.00"
                    }
                    type={isDollarType ? "wholeNumber" : "percent"}
                    onChange={handler ?? null}
                    {...(!isDollarType ? { precision: 1 } : {})}
                  />
                </CustomFormItem>
              </Col>
              <Col
                xs={5}
                md={4}
                lg={5}
                className="mt-7"
                align="center"
                style={{ marginBottom: -5 }}
              >
                <ConfigProvider theme={switchTheme}>
                  <Switch
                    checkedChildren="$"
                    unCheckedChildren="%"
                    checked={isDollarType}
                    onChange={handleTypeChange}
                  />
                </ConfigProvider>
              </Col>
            </Row>
          </Col>
        );
      }
      case "tax": {
        const initialValue = selectedTax;
        return (
          <Col key={key} xs={24} md={12} lg={8}>
            <CustomFormItem
              isbuyer
              className="flex-grow"
              label={"Monthly Taxes".toUpperCase()}
              name={name}
              initialValue={initialValue}
              mb="0"
              required
            >
              <Radio.Group
                className="buyer flex-grow w-full"
                onChange={handleTaxChange}
              >
                <Space
                  className="w-full"
                  direction={isMobileXS ? "vertical" : "horizontal"}
                  size={isMobileXS ? 18 : 2}
                >
                  <Radio
                    value={"actual"}
                    className="buyer mx-0 w-full"
                    style={{ marginBottom: isMobileXS ? -20 : 0 }}
                  >
                    <CustomFormItem
                      label={"Actual Taxes".toUpperCase()}
                      name={"actual_tax"}
                      rules={rules}
                      mb="5"
                    >
                      <CustomInputNumber
                        isbuyer
                        prefix="$"
                        min={0}
                        placeholder={"0.00"}
                        onChange={handler ?? null}
                        onClick={() => {
                          form.setFieldValue("tax", "actual");
                          setSelectedTax("actual");
                        }}
                      />
                    </CustomFormItem>
                  </Radio>
                  <Radio
                    value={"estimated"}
                    className="estimated-tax buyer m-0 w-full"
                  >
                    <CustomFormItem
                      label={"Estimated Taxes".toUpperCase()}
                      name={"estimated_tax"}
                      mb="5"
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
                        onChange={handler ?? null}
                        disabled
                      />
                    </CustomFormItem>
                  </Radio>
                </Space>
              </Radio.Group>
            </CustomFormItem>
          </Col>
        );
      }
      default:
        return (
          <Col
            key={key}
            xs={24}
            md={12}
            lg={8}
            style={{
              marginBottom: -5,
              marginTop:
                (!isMobile && (isSellerCredit || isHOADues)) ||
                (isMobile && !isMobileXS && isLoanAmountMobile)
                  ? 26
                  : 0,
            }}
          >
            <CustomFormItem
              isbuyer
              label={label}
              name={name}
              required={rules && rules[0]?.required}
              rules={rules}
            >
              <CustomInputNumber
                isbuyer
                prefix="$"
                min={0}
                placeholder={"0.00"}
                onChange={handler ?? null}
                type={isWholeNumber ? "wholeNumber" : ""}
              />
            </CustomFormItem>
          </Col>
        );
    }
  };

  const generateSelector = (
    key,
    { label, name, rules, options, placeholder, handler, withsearch = "" }
  ) => {
    switch (label) {
      case "PROPERTY TYPE":
        return (
          <Col key={key} xs={24} md={12} lg={8} style={{ marginBottom: -5 }}>
            <Row>
              <Col xs={24} md={24} lg={24}>
                <CustomFormItem
                  label={label}
                  name={name}
                  required
                  rules={rules}
                  isbuyer={"true"}
                >
                  <CustomSelect
                    isbuyer={"true"}
                    placeholder={placeholder}
                    options={options}
                    disabled={!options?.length}
                    onChange={handler ?? null}
                  />
                </CustomFormItem>
              </Col>
            </Row>
            {(isCondo || condoTypes.includes(propertyType)) && (
              <Row style={{ marginTop: -18 }} className="mb-2">
                <Col xs={12} md={12} lg={12}>
                  <CustomFormItem
                    label={"FHA Approved".toUpperCase()}
                    name="first_time_home_buyers_approved"
                    initialValue={0}
                    mb="0"
                  >
                    <Radio.Group className="buyer" options={booleanOptions} />
                  </CustomFormItem>
                </Col>
                <Col xs={12} md={12} lg={12}>
                  <CustomFormItem
                    label={"VA Approved".toUpperCase()}
                    name="veterans_affairs_approved"
                    initialValue={0}
                    mb="0"
                  >
                    <Radio.Group className="buyer" options={booleanOptions} />
                  </CustomFormItem>
                </Col>
              </Row>
            )}
          </Col>
        );
      default:
        return (
          <Col key={key} xs={24} md={12} lg={8} style={{ marginBottom: -5 }}>
            <CustomFormItem
              isbuyer={"true"}
              label={label}
              name={name}
              required
              rules={rules}
            >
              <CustomSelect
                isbuyer={"true"}
                placeholder={placeholder}
                options={options}
                disabled={!options?.length}
                onChange={handler ?? null}
                withsearch={withsearch}
              />
            </CustomFormItem>
          </Col>
        );
    }
  };

  const generateInput = (key, { label, name, rules, placeholder }) => {
    const isDebtRatio = name === "debt_to_income_ratio";
    return (
      <Col
        key={key}
        xs={24}
        md={12}
        lg={8}
        className={isDebtRatio && "hidden"}
        style={{ marginBottom: -5 }}
      >
        <CustomFormItem
          isbuyer
          label={label}
          name={name}
          required={rules && rules[0]?.required}
          rules={rules}
        >
          <CustomInputNumber isbuyer min={0} placeholder={placeholder} />
        </CustomFormItem>
      </Col>
    );
  };

  const generateRadioGroup = (
    key,
    { label, name, initialValue, rules, options }
  ) => (
    <Col key={key} xs={24} md={12} lg={8} className="mb-2.5">
      <CustomFormItem
        isbuyer
        label={label}
        name={name}
        required={rules && rules[0]?.required}
        initialValue={initialValue}
        mb="0"
        rules={rules}
      >
        <Radio.Group className="buyer" options={options} value={initialValue} />
      </CustomFormItem>
    </Col>
  );

  const generateHeaderButton = ({ label, link }) => (
    <CustomButton
      isbuyer
      label={label}
      type="link"
      href={link}
      className="w-24"
    />
  );

  const generateModalButton = ({ label, handler }) => (
    <CustomButton isbuyer label={label} className={"w-24"} onClick={handler} />
  );

  const generateComputationDetails = ({ label, value }, key) => {
    const isRateAPR = label === "Rate / APR";
    const labelFontStyle = isMobile
      ? isRateAPR && isMobileXS
        ? "text-ssm"
        : "text-sm "
      : "text-base";
    const valueFont = isRateAPR ? "font-montserrat-bold" : "font-montserrat";

    return (
      <Row key={key}>
        <Col xs={10} sm={12} md={12} lg={12}>
          <p
            className={`text-neutral-1 tracking-wide font-montserrat m-[3px] ${labelFontStyle}`}
          >
            {label}
          </p>
        </Col>
        <Col xs={14} sm={12} md={12} lg={12}>
          <p
            className={`text-neutral-1 tracking-wide text-end m-[3px] ${valueFont} ${labelFontStyle}`}
          >
            {value}
          </p>
        </Col>
      </Row>
    );
  };

  const generateTotalDetail = ({ label, value }, key) => {
    const labelFontStyle = isMobile ? "text-sm" : "text-base";

    return (
      <Row key={key}>
        <Col xs={12} md={12} lg={12} className="self-center">
          <p
            className={`text-neutral-1 tracking-wide font-montserrat-semibold ${labelFontStyle}`}
            style={{ margin: 3 }}
          >
            {label}
          </p>
        </Col>
        <Col xs={12} md={12} lg={12}>
          <p
            className={`text-neutral-1 text-end tracking-wide font-montserrat-semibold ${labelFontStyle}`}
            style={{ margin: 3 }}
          >
            {value}
          </p>
        </Col>
      </Row>
    );
  };

  const condoReviewComponent = (
    <p
      className={`text-neutral-2 text-base font-sharp-sans ${
        isMobile ? "mt-4" : "mt-2"
      } mb-2 text-center`}
    >
      * subject to condo project review.
    </p>
  );

  const generateCalculationDetails = (
    key,
    title,
    information,
    searchId,
    quoteNumber,
    computations,
    totalItems
  ) => {
    const isVA = form.getFieldValue("veterans_affairs");
    const containerHeight =
      isLaptop && !isMobile && (totalItems > 1 || !isVA) ? "h-[246px]" : "";
    return (
      <Fragment>
        <Row key={key}>
          <Col
            xs={24}
            sm={24}
            lg={24}
            className={"border border-solid rounded-md border-alice-blue "}
            style={{ backgroundColor: "rgba(238,238,238)" }}
          >
            <div
              className={`${containerHeight} px-8 ${isCondo ? "pt-8" : "py-4"}`}
            >
              <h2
                className={`text-neutral-1 tracking-wide mt-0 font-montserrat-bold mb-1 ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                {title}
                {/*// Tentative removal until verbiage is finalized
               <Popover content={information} trigger={["click", "hover"]}>
                <InfoCircleOutlined className="ml-2" />
              </Popover> */}
              </h2>
              {computations.map((detail, key) => {
                return detail?.isPayment
                  ? generateTotalDetail(detail, key)
                  : generateComputationDetails(detail, key);
              })}
            </div>
            {isCondo && condoReviewComponent}
          </Col>
          <Col xs={24} sm={24} lg={24}>
            <p className="text-neutral-3 text-sm font-sharp-sans mt-1 mb-1 text-center">
              {`${searchId && "REF - " + searchId}${
                quoteNumber && ", ES" + quoteNumber
              }`}
            </p>
          </Col>
        </Row>
        {!showWarningMessage && preApprovalButton}
      </Fragment>
    );
  };

  const handleModalSubmit = async (values) => {
    values.county_id = values.county.value;

    try {
      await setRequestPaymentAction(
        homePriceValues,
        paymentDetails,
        values,
        dispatch
      );
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const scrollToBottom = (target) => {
    const targetElement = document.getElementById(target);
    targetElement.scrollIntoView({ behavior: "smooth" });
  };

  const emailModalHandler = (val) => {
    setShowEmailModal(val);
  };

  const handleToggleAdvanced = () => {
    setShowAdvanced((prevShowAdvanced) => !prevShowAdvanced);
  };

  const warningMessage = (
    <Row
      gutter={[20, 20]}
      id="home-price-calculation"
      className={`${showSellerCredit ? "mb-10" : "mb-5"} justify-center`}
    >
      {payments?.length !== 0 ? (
        <Row justify={"center"} className="my-5 max-w-[557px]">
          <div className="border border-solid rounded-lg border-warning-1 bg-warning-2">
            <Row>
              <Col xs={4} sm={2} md={2} lg={2} className="place-self-center">
                <div className="top-1 mx-5 mt-1.5">
                  <img
                    className="relative"
                    src={`${window.location.origin}/icon/warningIcon.png`}
                    alt="icon"
                  />
                </div>
              </Col>
              <Col xs={20} sm={22} md={22} lg={22}>
                <p className="text-neutral-1 text-sm font-sharp-sans-semibold mx-2">
                  {errorMessage + " "}
                  <a
                    onClick={emailModalHandler}
                    className="text-denim font-sharp-sans-medium hover:underline"
                  >
                    {"Please contact me."}
                  </a>
                </p>
              </Col>
            </Row>
          </div>
        </Row>
      ) : (
        <Row justify={"center"} className="my-5">
          <Col span={22} style={{ maxWidth: 834 }}>
            <p className="text-neutral-3 text-header-5 font-sharp-sans mx-2 text-center">
              No Results available for the selected options. You can try again
              using different options or contact us directly so we can help.
            </p>
          </Col>
        </Row>
      )}
    </Row>
  );

  const pricingAssumption = (
    <Row id={"pricing-assumption"} className="mb-5">
      <Col xs={24} sm={24} lg={24}>
        <p className="text-neutral-3 text-header-5 text-center font-sharp-sans-semibold m-0">
          Pricing Assumes Seller Credit of
        </p>
      </Col>
      <Col xs={24} sm={24} lg={24}>
        <p className="text-denim text-3xl text-center font-sharp-sans-bold mx-1 mt-1 mb-0">
          {`$${addCommas(formSellerCredit, true)}`.split(".")[0]}
        </p>
      </Col>
    </Row>
  );

  const preApprovalButton = (
    <Row className="mb-5">
      <Col xs={24} sm={24} lg={24} align={"center"}>
        <CustomButton
          className={isMobileXS ? "text-xs" : "text-base"}
          label="Request Pre-approval Letter"
          onClick={() => {
            modalForm.setFieldsValue({
              county: mapSelected(homePriceValues.county_id, counties, 'key'),
            })
            setShowModal(true)
          }}
        />
      </Col>
    </Row>
  );

  const contactInfo = (
    <Row className="justify-center mx-10 mb-10">
      <Col
        xs={24}
        sm={24}
        lg={24}
        className="border border-solid rounded-md border-alice-blue p-8 bg-white-smoke"
        style={{ maxWidth: 870 }}
      >
        <Row>
          <Col xs={24} sm={24} lg={24} align={"center"}>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
              {officerFullName}
            </h2>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} lg={24} align={"center"}>
            <p className="text-neutral-3 text-lg text-center font-sharp-sans-semibold m-0">
              {officerJobTitle}
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} lg={24} align={"center"}>
            <p className=" text-base my-0 text-center">
              <a
                onClick={emailModalHandler}
                className="text-denim font-sharp-sans-medium hover:underline"
              >
                {officerEmail}
              </a>
            </p>
          </Col>
        </Row>
        {officerContactNum && (
          <Row>
            <Col xs={24} sm={24} lg={24} align={"center"}>
              <p className=" text-base my-0 text-center">
                <a
                  href={`tel:${removeNonIntegers(officerContactNum)}`}
                  className="text-denim font-sharp-sans-medium hover:underline"
                >
                  {officerContactNum}
                </a>
              </p>
            </Col>
          </Row>
        )}
        <Row>
          <Col xs={24} sm={24} lg={24} align={"center"}>
            <p className="text-neutral-3 text-sm text-center font-sharp-sans-medium mb-6">
              {`NMLS# ${officerNMLS}`}
            </p>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} lg={24} align={"center"}>
            <div className="justify-center flex flex-row gap-4 items-center	mt-3">
              {isMobileDevice && officerContactNum && (
                <Fragment>
                  {generateHeaderButton({
                    label: "Call",
                    link: `tel:${removeNonIntegers(officerContactNum)}`,
                  })}
                  {generateHeaderButton({
                    label: "Text",
                    link: `sms:${removeNonIntegers(officerContactNum)}`,
                  })}
                </Fragment>
              )}
              {generateModalButton({
                label: "Email",
                handler: emailModalHandler,
              })}
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  const optionalDetails = (
    <Col xs={12} md={6} lg={4} className="mb-2.5">
      <CustomFormItem
        label={"Military/Veteran?".toUpperCase()}
        name={"veterans_affairs"}
        initialValue={0}
        mb="0"
      >
        <Radio.Group className="buyer" options={booleanOptions} value={0} />
      </CustomFormItem>
    </Col>
  );

  return (
    <>
      <Row
        className="justify-center mx-10 "
        style={isLoading && { marginBottom: -40 }}
      >
        <Col span={24} style={{ maxWidth: 870 }}>
          <Form
            form={form}
            className="mt-5 pb-5"
            validateMessages={validateMessages}
            onFinish={onHandleFinish}
          >
            <div id="_inputs-container_">
              <Row gutter={[0, 20]}>
                <Col xs={24} sm={24} lg={24}>
                  <Row gutter={[5, 6]} style={{ marginBottom: -20 }}>
                    {inputDetails.map((detail, key) =>
                      handleGenerators(key, detail)
                    )}
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col
                  xs={24}
                  sm={24}
                  lg={24}
                  align="end"
                  className="my-5 text-end"
                >
                  <ConfigProvider theme={customButtonTheme}>
                    <Button type="text" onClick={handleToggleAdvanced}>
                      <span className="text-base text-neutral-2 font-sharp-sans-semibold">
                        {showAdvanced ? (
                          <MinusOutlined className="text-denim" />
                        ) : (
                          <PlusOutlined className="text-denim" />
                        )}{" "}
                        Advanced Search
                      </span>
                    </Button>
                  </ConfigProvider>
                </Col>
                {showAdvanced && (
                  <Col xs={24} sm={24} lg={24}>
                    <Row gutter={[5, 0]} style={{ marginBottom: -20 }}>
                      {advancedSearchDetails.map((detail, key) =>
                        handleGenerators(key, detail)
                      )}
                      {!isCondo && optionalDetails}
                    </Row>
                  </Col>
                )}
              </Row>
            </div>
            <Row
              id="get-payments"
              className="w-full flex flex-col items-center mt-8"
            >
              <UplistGetPaymentButton loadingGetPayments={isLoading} />
            </Row>
          </Form>
          {isLoading ? (
            <Row
              gutter={[20, 20]}
              className={`${
                showSellerCredit ? "mb-10" : "mb-5"
              } justify-center	mx-10`}
            >
              <LoadingOBResultsComponent style={{ marginTop: -10 }} />
            </Row>
          ) : (
            <Fragment>
              {showWarningMessage && errorMessage && warningMessage}
              {hasPayments && (
                <Row
                  gutter={[20, 20]}
                  id="home-price-calculation"
                  className={`${
                    showSellerCredit ? "mb-10" : "mb-5"
                  } justify-center`}
                >
                  {paymentValues?.map((item, index) => {
                    return (
                      item && (
                        <Col
                          key={index}
                          className={`${errorMessage && "mb-5"}`}
                          xs={24}
                          sm={24}
                          md={24}
                          lg={12}
                          style={{ maxWidth: 834 }}
                        >
                          {item}
                        </Col>
                      )
                    );
                  })}
                </Row>
              )}
            </Fragment>
          )}
          {showSellerCredit && pricingAssumption}
        </Col>
      </Row>

      {contactInfo}
      <Row id="home-price-calculation" className="justify-center">
        <Col
          xs={24}
          sm={24}
          lg={24}
          align={"center"}
          className="mb-6 px-15"
          style={{ marginTop: -50 }}
        >
          <Row className="mt-10 mx-10 justify-center" style={{ maxWidth: 870 }}>
            <ConfigProvider theme={collapseTheme}>
              <Collapse
                className={`bg-white w-full mx-auto flex justify-center items-center flex-col`}
              >
                <Panel
                  header="Disclosures and Assumptions"
                  className={`w-full font-sharp-sans-semibold bg-white-smoke-2 border-alice-blue rounded-lg pt-1.5 pb-0.5 ${
                    screens.xs ? "text-sm" : "text-xl"
                  }`}
                  showArrow={false}
                  extra={<DownOutlined className="text-lg" />}
                >
                  <DisclosureAndAssumptionsComponent
                    licenseData={{
                      state: { disclosure: stateDisclosure, name: stateName },
                      company: loanOfficer?.company || {},
                      user: {
                        first_name: loanOfficer?.first_name || "",
                        last_name: loanOfficer?.last_name || "",
                        nmls_num: loanOfficer?.nmls_num || "",
                        mobile_number: loanOfficer?.mobile_number || "",
                      },
                      company_state_license: companyStateLicense,
                      state_metadata: stateMetaData,
                      license: { license: userStateLicense },
                    }}
                  />
                </Panel>
              </Collapse>
            </ConfigProvider>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={24} sm={24} lg={24} align={"center"} className="mb-6">
          <img
            className="relative w-12"
            style={{ height: 48.76 }}
            src={`${window.location.origin}/icon/${
              equalHousingDetail === "equal_housing_lender"
                ? "equal_housing_lender.png"
                : "equal_housing_opportunity.png"
            }`}
            alt="icon"
          />
        </Col>
      </Row>
      <Modal
        centered
        open={showModal}
        footer={null}
        width={620}
        onCancel={handleCancel}
        className="prompt"
        closable={false}
      >
        <div className="bg-white h-fit">
          <Row className="mb-6">
            <Col className="mb-4" xs={24} md={24} lg={24}>
              <h2
                className={`text-denim my-0 font-sharp-sans-bold ${
                  isMobileXS ? "text-2xl" : "text-3xl"
                }`}
              >
                Property Address
              </h2>
            </Col>
            <Col xs={24} md={24} lg={24}>
              <CustomDivider />
            </Col>
          </Row>
          <Form form={modalForm} onFinish={handleModalSubmit}>
            <Row gutter={[5, 2]}>
              <Col xs={24} md={24} lg={24}>
                <CustomFormItem
                  label="Property Address"
                  name="address"
                  required
                  rules={config.requiredRule}
                >
                  <CustomTextArea type="text" placeholder="Enter Address" />
                </CustomFormItem>
              </Col>
              <Col xs={24} md={12} lg={9}>
                <CustomFormItem
                  label="City"
                  name="city"
                  required
                  rules={config.requiredRule}
                >
                  <CustomInput type="text" placeholder="Enter City" />
                </CustomFormItem>
              </Col>
              <Col xs={24} md={12} lg={5}>
                <CustomFormItem label="State" name="state" required>
                  <CustomSelect disabled />
                </CustomFormItem>
              </Col>
              <Col xs={24} md={12} lg={5}>
                <CustomFormItem
                  label="Zip"
                  name="zip"
                  required
                  rules={config.requiredRule}
                >
                  <CustomInput type="number"/>
                </CustomFormItem>
              </Col>
              <Col xs={24} md={12} lg={5}>
                <CustomFormItem
                  label="County"
                  name="county"
                  required
                  rules={[{ required: true }]}
                >
                  <CustomSelect disabled/>
                </CustomFormItem>
              </Col>
            </Row>
            <Row gutter={[10, 10]} className="text-end">
              <Col xs={24} md={12} lg={12}>
                <Button
                  type="text"
                  className={`font-sharp-sans-semibold bg-white border-xanth marker ${
                    isXsOrSm && isNotMd ? "w-full" : "w-32"
                  }`}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </Col>
              <Col xs={24} md={12} lg={12}>
                <Button
                  htmlType="submit"
                  type="text"
                  className={`font-sharp-sans-semibold bg-xanth border-xanth ${
                    isMobileXS ? "text-xs w-full p-0" : "w-full"
                  }`}
                  disabled={!counties.length || isLoading}
                  style={
                    !shouldApplyWidth
                      ? {
                          width: 267,
                        }
                      : {}
                  }
                >
                  {isLoading ? (
                    <LoadingOutlined />
                  ) : (
                    "Request Pre-approval Letter"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
      <SendEmailModal
        showModal={showEmailModal}
        modalHandler={emailModalHandler}
        errorMessage={errorMessage}
        otherDetails={{ ...homePriceValues, payments: paymentDetails }}
      />
    </>
  );
};

export default HomePrice;
