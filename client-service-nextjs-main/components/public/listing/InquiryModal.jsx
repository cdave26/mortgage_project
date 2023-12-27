import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Checkbox } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Link from "next/link";

import config from "~/config";
import { getCookie } from "~/store/auth/api";
import { setAgentListingStatesAction } from "~/store/publicstore/action";
import { sendAgentListingInquiryAPI } from "~/store/publicstore/api";
import { onHandleError } from "~/error/onHandleError";
import { onMobileNumber } from "~/lib/events";
import { validateMobileNumber } from "~/plugins/mobileNumber";

import CustomInput from "~/components/base/CustomInput";
import CustomButton from "~/components/base/CustomButton";
import Modal from "~/components/modal/Modal";
import CustomDivider from "~/components/base/CustomDivider";
import CustomHollowButton from "~/components/base/buttons/CustomHollowButton";
import CustomFormItem from "~/components/base/CustomFormItem";

const { TextArea } = Input;

const AgentListingInquiryModal = () => {
  const submitButton = useRef(null);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const { loanOfficerData, showInquiryModal } = useSelector(
    (state) => ({
      loanOfficerData: state.publicStore.publicAgentListing.loanOfficerData,
      showInquiryModal:
        state?.publicStore?.publicAgentListing?.showInquiryModal,
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
  } = loanOfficerData;

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
        };

        const response = await sendAgentListingInquiryAPI(payload, signal);

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
          dispatch(setAgentListingStatesAction({ showInquiryModal: false }));
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
    dispatch(setAgentListingStatesAction({ showInquiryModal: false }));
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

export default AgentListingInquiryModal;
