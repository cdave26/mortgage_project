import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Input, Checkbox } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import config from "~/config";
import { addCommas, parseWholeAmount } from "~/plugins/formatNumbers";
import { getCookie } from "~/store/auth/api";
import { sendLiveInHomeRatesInquiryAction } from "~/store/listing/action";
import { onHandleError } from "~/error/onHandleError";
import { LiveInHomeRatesContext } from "~/utils/context";
import { onMobileNumber } from "~/lib/events";
import { validateMobileNumber } from "~/plugins/mobileNumber";

import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomButton from "../base/CustomButton";
import Modal from "../modal/Modal";
import CustomDivider from "../base/CustomDivider";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import { isEmpty } from "lodash";
import buydown from "~/enums/buydown";

const { TextArea } = Input;

const SendInquiryModal = () => {
  const submitButton = useRef(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { contextData, stateSetter } = useContext(LiveInHomeRatesContext);

  const { publicListingData, creditScoreOptions, occupancyOptions } =
    useSelector((state) => {
      return {
        publicListingData: state.publicStore.publicListing.data,
        creditScoreOptions: state.creditScoreRange.items,
        occupancyOptions: state.occupancyType.items,
      };
    }, shallowEqual);

  const {
    id: listingId,
    property_address,
    property_apt_suite,
    property_city,
    property_zip,
    state: { abbreviation },
    property_value,
    company: {
      name: companyName,
      company_privacy_policy_URL,
      company_terms_of_tervice_URL,
    },
    sub_company: { code },
    user: { first_name, last_name, email },
    page_link,
  } = publicListingData;

  const {
    isFirstTimeBuyer,
    isVetMilitary,
    loanAmount,
    downPercent,
    downPayment,
    showModal,
    creditScore,
    occupancyType,
    sellerCredits,
    getPaymentResults,
  } = contextData;

  const listingUrl = `${config.appUrl}/${code}${page_link}/${listingId}`;

  useEffect(() => {
    if (showModal) {
      form.setFields([
        {
          name: "email_to",
          value: `${email}`,
        },
      ]);
    }
  }, [showModal]);

  const boolValues = {
    true: "Yes",
    false: "No",
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
      return val ? `$ ${parseWholeAmount(val)}` : "0";
    }
    return val ? `$ ${addCommas(val, true)}` : "0";
  };

  const transformPaymentResults = (results) => {
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

  const handleFinish = (values) => {
    setIsLoading(true);
    getCookie().then(async () => {
      const controller = new AbortController();
      const { signal } = controller;

      try {
        const address = `${property_address}, ${
          property_apt_suite ? `${property_apt_suite} ` : ""
        }${property_city}, ${abbreviation} ${property_zip}`;

        const payload = {
          ...values,
          first_name,
          last_name,
          email,
          property_address: address,
          listing_price: checkCurrency(
            parseFloat(property_value).toFixed(),
            true
          ),
          loan_amount: checkCurrency(loanAmount, true),
          seller_credits: checkCurrency(sellerCredits, true),
          down_payment: checkCurrency(downPayment),
          down_payment_percent: downPercent ? `${downPercent.toFixed()}%` : "",
          listing_url: listingUrl,
          is_military_veteran: boolValues[isVetMilitary],
          is_first_time_home_buyer: boolValues[isFirstTimeBuyer],
          credit_score: getArrayValue(creditScoreOptions, creditScore.value),
          occupancy_type: getArrayValue(occupancyOptions, occupancyType.value),
          buydown: contextData.buydown?.label ?? buydown.NONE,
          get_payment_results: transformPaymentResults(getPaymentResults),
        };

        const response = await sendLiveInHomeRatesInquiryAction(
          payload,
          signal
        );

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
          stateSetter({ showModal: false });
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
    stateSetter({ showModal: false });
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
    <Modal open={showModal} onCancel={onCancel} className="modal-form">
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

export default SendInquiryModal;
