import React, { useState } from "react";
import { Button, Form, Modal, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import { getCookie } from "~/store/auth/api";
import { checkUserAction } from "~/store/users/action";
import {
  onOpenForgotPasswordModal,
  onOpenOtpModal,
  onSetUserEmail,
} from "~/store/auth/action";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";

import CustomButton from "../../components/base/CustomButton";
import CustomDivider from "../../components/base/CustomDivider";
import CustomFormItem from "../../components/base/CustomFormItem";
import CustomInput from "../../components/base/CustomInput";

import VerificationOtpModal from "../verification/VerificationOtpModal";

const ForgotPasswordModal = (props) => {
  const { isbuyer } = props;
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const company = useSelector((state) => state.company.companyLogoDetails);
  const { openForgotPasswordModal } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    setIsLoading(true);
    getCookie()
      .then(() => {
        const controller = new AbortController();
        const { signal } = controller;

        checkUserAction(
          {
            email: values.email,
            company_id: company.id,
          },
          signal
        )
          .then(() => {
            setIsLoading(false);
            onOpenForgotPasswordModal(false, dispatch);
            localStorage.setItem("source", "forgot-password");
            onSetUserEmail(values.email, dispatch);
            form.resetFields();
            onOpenOtpModal(true, dispatch);
          })
          .catch((err) => {
            console.log("err", err);
            setIsLoading(false);
            return onHandleError(err, dispatch);
          });
      })
      .catch((err) => {
        setIsLoading(false);
        return onHandleError(err, dispatch);
      });
  };

  const handleClose = () => {
    onOpenForgotPasswordModal(false, dispatch);
    form.resetFields();
  };

  return (
    <>
      <Modal
        centered
        open={openForgotPasswordModal}
        footer={null}
        width={400}
        onCancel={handleClose}
        className="prompt"
      >
        <Row className="flex justify-center w-full items-center">
          <div className="bg-white h-fit">
            <div>
              <div className="flex flex-col items-center mb-6">
                <Row className="mb-4">
                  <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
                    Forgot Password?
                  </h2>
                </Row>
                <CustomDivider color={isbuyer && "#00CFE1"} />
                <Row>
                  <p className="text-neutral-3 my-0 text-base text-center font-sharp-sans-medium leading-6">
                    Please enter your email address. You will receive a link to
                    create a new password via email.
                  </p>
                </Row>
              </div>
              <Form form={form} layout="vertical" onFinish={handleFinish}>
                <CustomFormItem
                  label="Email Address"
                  name="email"
                  required
                  mb="6"
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
                <Form.Item className="mb-0">
                  <CustomButton
                    label="Send"
                    isfullwidth={true}
                    htmlType="submit"
                    disabled={isLoading}
                    isloading={isLoading.toString()}
                    isbuyer={isbuyer}
                  />
                </Form.Item>
              </Form>
              <Row className="mt-7">
                <Button
                  type="link"
                  className={`${
                    isbuyer ? "text-buyer" : "text-xanth"
                  } font-sharp-sans-bold p-0`}
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <ArrowLeftOutlined /> Back to login
                </Button>
              </Row>
            </div>
          </div>
        </Row>
      </Modal>
      <VerificationOtpModal />
    </>
  );
};

export default ForgotPasswordModal;
