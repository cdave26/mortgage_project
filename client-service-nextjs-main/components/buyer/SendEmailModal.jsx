import React, { useEffect, useState } from "react";
import { Form, Input } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import config from "~/config";
import { getCookie } from "~/store/auth/api";
import { sendLiveInHomeRatesInquiryAction } from "~/store/listing/action";
import { onHandleError } from "~/error/onHandleError";

import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomButton from "../base/CustomButton";
import Modal from "../modal/Modal";
import CustomDivider from "../base/CustomDivider";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import {
  sendEmailAction,
  setPreApprovalInProgressAction,
} from "~/store/buyersPreApproval/action";

const { TextArea } = Input;

const SendEmailModal = (props) => {
  const {
    showModal,
    modalHandler,
    errorMessage,
    otherDetails,
    isFromBuyerProfile,
  } = props;
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { buyer, isLoading } = useSelector(({ buyer, buyersPreApproval }) => {
    return {
      buyer: buyer.buyerDetails,
      isLoading: buyersPreApproval.isLoading,
    };
  }, shallowEqual);

  useEffect(() => {
    if (showModal) {
      form.setFieldsValue({
        recipient: buyer?.loan_officer?.email || "",
        sender: `${buyer?.borrower_first_name || ""} ${
          buyer?.borrower_last_name || ""
        }`,
        contact_number: buyer?.borrower_mobile_number || "",
        email: buyer?.borrower_email || "",
        comments: errorMessage || "",
      });
    }
  }, [showModal, buyer]);

  const handleFinish = async (values) => {
    try {
      await sendEmailAction({ ...values, ...otherDetails }, dispatch);
      onCancel();
    } catch (error) {
      onHandleError(error, dispatch);
    }
  };

  const onCancel = () => {
    form.resetFields();
    modalHandler(false);
    setPreApprovalInProgressAction(dispatch, false);
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
        <CustomFormItem label="Email To" name="recipient" mb={2} disabled>
          <CustomInput type="text" disabled={true} />
        </CustomFormItem>
        <CustomFormItem
          label="Your Name"
          name="sender"
          required
          mb={2}
          rules={config.requiredRule}
        >
          <CustomInput type="text" />
        </CustomFormItem>
        <CustomFormItem
          label="Your Email"
          name="email"
          required
          mb={2}
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
          name="contact_number"
          required
          mb={2}
          rules={config.requiredRule}
        >
          <CustomInput type="text" />
        </CustomFormItem>
        {!isFromBuyerProfile && (
          <CustomFormItem
            label="Property Address"
            name="property_address"
            required
            mb={2}
            rules={config.requiredRule}
          >
            <TextArea
              maxLength={500}
              style={{
                width: "100%",
                height: "56px",
              }}
            />
          </CustomFormItem>
        )}
        <CustomFormItem
          label="Comment"
          name="comments"
          required
          rules={config.requiredRule}
        >
          <TextArea
            maxLength={500}
            style={{
              width: "100%",
              height: "56px",
            }}
          />
        </CustomFormItem>
        <div className="flex justify-end gap-3 w-full">
          <CustomHollowButton
            className="bg-white"
            onClick={onCancel}
            label="Cancel"
          />
          <CustomButton
            htmlType="submit"
            isloading={String(isLoading)}
            disabled={isLoading}
            label={"Send"}
          />
        </div>
      </Form>
    </Modal>
  );
};

export default SendEmailModal;
