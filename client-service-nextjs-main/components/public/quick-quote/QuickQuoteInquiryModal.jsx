import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Checkbox } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import config from "~/config";
import { addCommas, parseWholeAmount } from "~/plugins/formatNumbers";
import { getCookie } from "~/store/auth/api";
import { setPubQuickQuoteStatesAction } from "~/store/publicstore/action";
import { sendQuickQuoteInquiryAPI } from "~/store/publicstore/api";
import { onHandleError } from "~/error/onHandleError";
import { onMobileNumber } from "~/lib/events";
import { validateMobileNumber } from "~/plugins/mobileNumber";

import CustomInput from "~/components/base/CustomInput";
import CustomButton from "~/components/base/CustomButton";
import Modal from "~/components/modal/Modal";
import CustomDivider from "~/components/base/CustomDivider";
import CustomHollowButton from "~/components/base/buttons/CustomHollowButton";
import CustomFormItem from "~/components/base/CustomFormItem";
import buydown from "~/enums/buydown";
import { isEmpty } from "lodash";

const { TextArea } = Input;

const QuickQuoteInquiryModal = () => {
  const submitButton = useRef(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const {
    publicQuickQuoteData,
    sellerCredits,
    selectedState,
    showInquiryModal,
    resultsData,
    creditScoreOptions,
    occupancyOptions,
    propertyTypeOptions,
    unitsCountOptions,
  } = useSelector(
    (state) => ({
      publicQuickQuoteData: state?.publicStore?.publicQuickQuote?.data,
      sellerCredits: state?.publicStore?.publicQuickQuote?.sellerCredits,
      selectedState: state?.publicStore?.publicQuickQuote?.selectedState,
      showInquiryModal: state?.publicStore?.publicQuickQuote?.showInquiryModal,
      resultsData: state?.publicStore?.publicQuickQuote?.resultsData,
      creditScoreOptions: state.creditScoreRange.items,
      occupancyOptions: state.occupancyType.items,
      propertyTypeOptions: state.propertyType.items,
      unitsCountOptions: state.numberOfUnits.data,
    }),
    shallowEqual
  );

  const {
    first_name,
    last_name,
    email,
    company: {
      name: companyName,
      company_privacy_policy_URL,
      company_terms_of_tervice_URL,
    },
  } = publicQuickQuoteData;

  useEffect(() => {
    if (showInquiryModal) {
      form.setFields([
        {
          name: "email_to",
          value: `${email}`,
        },
      ]);
    }
  }, [showInquiryModal]);

  const boolValues = {
    true: "Yes",
    false: "No",
  };

  const loanPurposeValues = {
    Purchase: "Purchase",
    RefiCashout: "Refinance Cash Out (Yes)",
    RefiRateTermLimitedCO: "Refinance Cash Out (No)",
  };

  const getArrayValue = (dataArray, val) => {
    const selected = dataArray.filter((arr) => arr.value === val);
    if (selected.length) {
      return selected[0].label;
    }
    return "";
  };

  const checkCurrency = (val, isWholeAmount = false) => {
    if (isWholeAmount) {
      return val ? `$${parseWholeAmount(val)}` : "0";
    }
    return val ? `$${addCommas(val, true)}` : "0";
  };

  const transformPaymentResults = (results) => {
    if (!results) return [];
    return results.map((result) => {
      const {
        name,
        interest_rate,
        monthly_principal_interest,
        annual_percentage_rate,
        total_payment,
        search_id,
        tax,
        homeowners_association_fee,
        insurance,
        mortgage_insurance,
        lock_period,
        buydown: Buydown,
        buydown_cost,
      } = result;

      const mapped = {
        Name: `${
          name === "NonConforming" ? "Jumbo" : name
        } ${lock_period} Year Fixed`,
        "Search ID": search_id,
        "Rate/Apr": `${interest_rate.toFixed(
          3
        )}% / ${annual_percentage_rate.toFixed(3)}%`,
        "Monthly P&I": checkCurrency(monthly_principal_interest),
        Taxes: checkCurrency(tax),
        Insurance: checkCurrency(insurance),
        Buydown,
      };

      if (!!mortgage_insurance) {
        mapped.MI = checkCurrency(mortgage_insurance);
      }

      mapped["Total PMT"] = checkCurrency(total_payment);

      if (!!homeowners_association_fee) {
        mapped["HOA Dues"] = checkCurrency(homeowners_association_fee);
      }

      if (!isEmpty(Buydown)) {
        mapped['Buydown Cost'] = checkCurrency(buydown_cost);
      }

      return mapped;
    });
  };

  const buydowns = {
    [buydown.NONE]: 'None',
    [buydown.THREE_TWO_ONE]: '3/2/1',
    [buydown.TWO_ONE]: '2/1',
    [buydown.ONE_ZERO]: '1/0',
  }

  const handleFinish = (values) => {
    setIsLoading(true);
    getCookie().then(async () => {
      const controller = new AbortController();
      const { signal } = controller;

      try {
        const payload = {
          ...values,
          first_name,
          last_name,
          email,
          ...(!isEmpty(resultsData) ? {
            home_price: checkCurrency(
              parseFloat(resultsData?.property_value ?? 0).toFixed(),
              true
            ),
            loan_purpose: resultsData?.loan_purpose
              ? loanPurposeValues[resultsData?.loan_purpose]
              : "",
            loan_amount: checkCurrency(resultsData?.loan_amount, true),
            down_payment: checkCurrency(resultsData?.down_payment, true),
            down_payment_percent: resultsData?.down_payment_percent
              ? `${resultsData?.down_payment_percent}%`
              : "",
            ltv: resultsData?.ltv ? `${resultsData?.ltv}%` : "",
            credit_score: getArrayValue(
              creditScoreOptions,
              resultsData?.credit_score
            ),
            occupancy_type: getArrayValue(
              occupancyOptions,
              resultsData?.occupancy
            ),
            property_type: getArrayValue(
              propertyTypeOptions,
              resultsData?.property_type
            ),
            property_state: selectedState,
            property_county: resultsData?.county?.value ?? "",
            is_military_veteran:
              boolValues[resultsData?.is_military_veteran ?? false],
            monthly_taxes: checkCurrency(resultsData?.property_taxes),
            homeowners_insurance: checkCurrency(
              resultsData?.homeowners_insurance
            ),
            hoa_dues: checkCurrency(resultsData?.hoa_dues),
            seller_credits: checkCurrency(resultsData?.seller_credits, true),
            units_count: getArrayValue(
              unitsCountOptions,
              resultsData?.units_count
            ),
            heloc_loan_amount: checkCurrency(resultsData?.heloc_loan_amount),
            is_first_time_home_buyer:
              boolValues[resultsData?.is_first_time_buyer ?? false],
            is_self_employed: boolValues[resultsData?.is_self_employed ?? false],
            buydown: buydowns[resultsData.buydown],
            get_payment_results: transformPaymentResults(resultsData?.results),
          } : {}),
        };

        const response = await sendQuickQuoteInquiryAPI(payload, signal);

        if (response.status === 200) {
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: response.data.message,
              description: "",
              position: "topRight",
              type: "success",
            },
          });

          form.resetFields();
          dispatch(setPubQuickQuoteStatesAction({ showInquiryModal: false }));
        }
      } catch (error) {
        onHandleError(error, dispatch);
      } finally {
        setIsLoading(false);
        setIsChecked(false);
      }
    });
  };

  const onCancel = () => {
    form.resetFields();
    setIsLoading(false);
    setIsChecked(false);
    dispatch(setPubQuickQuoteStatesAction({ showInquiryModal: false }));
  };

  const checkCompanyTOS = () => {
    return !company_terms_of_tervice_URL ? (
      <span>terms of service</span>
    ) : (
      <Link
        href={company_terms_of_tervice_URL}
        target="_blank"
        className="font-sharp-sans-bold text-xanth"
        rel="noopener noreferrer"
      >
        terms of service
      </Link>
    );
  };

  return (
    <Modal open={showInquiryModal} onCancel={onCancel} className="modal-form">
      <Form form={form} onFinish={handleFinish}>
        <div className="flex justify-start items-start mt-7 mb-4">
          <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
            Send Email
          </h2>
        </div>
        <div className="mb-8">
          <CustomDivider />
        </div>
        <CustomFormItem label="Email To" name="email_to" disabled>
          <CustomInput type="text" disabled={true} />
        </CustomFormItem>
        <CustomFormItem
          label="Your Name"
          name="sender_name"
          required
          rules={config.requiredRule}
        >
          <CustomInput type="text" />
        </CustomFormItem>
        <CustomFormItem
          label="Your Email"
          name="sender_email"
          required
          rules={[
            ...config.requiredRule,
            {
              type: "email",
              message: "Email address must be valid.",
            },
          ]}
        >
          <CustomInput type="text" />
        </CustomFormItem>
        <CustomFormItem
          label="Your Phone Number"
          name="sender_phone"
          required
          rules={config.requiredRule}
        >
          <CustomInput
            type="text"
            onKeyDown={onMobileNumber}
            onChange={(event) =>
              validateMobileNumber(
                event.target.value,
                form,
                "sender_phone",
                submitButton
              )
            }
          />
        </CustomFormItem>
        <CustomFormItem label="Comment" name="sender_comment">
          <TextArea
            maxLength={500}
            className="w-full"
            style={{ height: "56px" }}
          />
        </CustomFormItem>

        <Checkbox
          checked={isChecked}
          onChange={(e) => setIsChecked(e.target.checked)}
          className="inquiry-modal-checkbox font-sharp-sans-medium text-neutral-3 mb-5"
        >
          <span className="text-neutral-3 font-sharp-sans-medium text-body-4">
            I accept the{" "}
            <Link
              href={company_privacy_policy_URL}
              target="_blank"
              className="font-sharp-sans-bold text-xanth"
              rel="noopener noreferrer"
            >
              privacy policy
            </Link>{" "}
            and {checkCompanyTOS()} for {companyName}.
          </span>
        </Checkbox>

        <div className="flex justify-end gap-3 w-full">
          <div>
            <CustomHollowButton onClick={onCancel} label="Cancel" />
          </div>
          <div
            className={`${
              !isChecked ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <CustomButton
              htmlType="submit"
              className={`${!isChecked && "pointer-events-none"}`}
              disabled={isLoading}
              isloading={isLoading.toString()}
              label="Send"
              ref={submitButton}
            />
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default QuickQuoteInquiryModal;
