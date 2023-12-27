import React, { useState } from "react";
import { Col, Form, Row, Input, Modal } from "antd";
import { EyeInvisibleFilled, EyeFilled } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";

import {
  getCookie,
  logout,
  sendVerificationEmail,
  setNewPassword,
} from "~/store/auth/api";
import { onOpenResetPasswordModal, onSetUserEmail } from "~/store/auth/action";
import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";

import CustomButton from "../../components/base/CustomButton";
import CustomDivider from "../../components/base/CustomDivider";
import CustomFormItem from "../../components/base/CustomFormItem";

const ResetPasswordModal = (props) => {
  const { isbuyer } = props;
  const [showPassword, setShowPassword] = useState("password");
  const [showConfirmPassword, setShowConfirmPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const dispatch = useDispatch();
  const { openResetPasswordModal, userEmail } = useSelector(
    (state) => state.auth
  );
  const [form] = Form.useForm();

  const source = window.localStorage.getItem("source");
  const fromNewUser = !source || (source && source !== "forgot-password");

  const device = useSelector(state => state.device)

  const handleFinish = (values) => {
    setIsLoading(true);
    getCookie()
      .then(() => {
        const controller = new AbortController();
        const { signal } = controller;

        setNewPassword(
          {
            email: userEmail,
            password: values.password,
            password_confirmation: values.password_confirmation,
            ...device,
          },
          signal
        )
          .then((res) => {
            if (res.status === 200) {
              onOpenResetPasswordModal(false, dispatch);
              setOpenSuccessModal(true);
              setIsLoading(false);
              form.resetFields();
            }
          })
          .catch((err) => {
            setIsLoading(false);
            const errSplit = err.response.data.message.split(" ");

            if (errSplit.includes("least")) {
              onHandleError(
                err,
                dispatch,
                "The password must meet the requirements below."
              );
              return;
            }

            if (errSplit.includes("confirmation")) {
              onHandleError(
                err,
                dispatch,
                "The password field confirmation does not match."
              );
              return;
            }

            return onHandleError(err, dispatch);
          });
      })
      .catch((err) => {
        setIsLoading(false);
        return onHandleError(err, dispatch);
      });
  };

  const errorClose = (err = null) => {
    onSetUserEmail(null, dispatch);
    setOpenSuccessModal(false);
    dispatch({ type: "logout" });
    logout();
    setIsLoading(false);
    onHandleError(err, dispatch);
  };

  const handleContinue = () => {
    setIsLoading(true);

    if (fromNewUser) {
      const controller = new AbortController();
      const { signal } = controller;
      const token = window.localStorage.getItem("user");

      sendVerificationEmail({ email: userEmail }, signal)
        .then(() => {
          onSetUplistCookies(token)
            .then(() => {
              dispatch({
                type: "UI/snackbars",
                payload: {
                  open: true,
                  message: "Success",
                  description: "Redirecting to Dashboard.",
                  position: "topRight",
                  type: "success",
                },
              });

              onSetUserEmail(null, dispatch);
              setOpenSuccessModal(false);
              setIsLoading(false);
            })
            .catch((err) => errorClose(err));
        })
        .catch((err) => errorClose(err));
    } else {
      dispatch({ type: "logout" });
      logout();
      window.localStorage.removeItem("source");
      onSetUserEmail(null, dispatch);
      setOpenSuccessModal(false);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenResetPasswordModal(false, dispatch);
    form.resetFields();

    if (fromNewUser) {
      onSetUserEmail(null, dispatch);
      setOpenSuccessModal(false);
      dispatch({ type: "logout" });
      logout();
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onSetUserEmail(null, dispatch);
      window.localStorage.removeItem("source");
    }
  };

  const handleShow = (el) => {
    const show = el === "pass" ? setShowPassword : setShowConfirmPassword;
    const passState = el === "pass" ? showPassword : showConfirmPassword;

    show("password" === passState ? "text" : "password");
  };

  const renderSuffixIcon = (el) => {
    const passState = el === "pass" ? showPassword : showConfirmPassword;

    return passState === "password" ? (
      <EyeFilled onClick={() => handleShow(el)} />
    ) : (
      <EyeInvisibleFilled onClick={() => handleShow(el)} />
    );
  };

  const handleCheckNewPassword = (e) => {
    const password = e.target.value;
    const passLength = document.getElementById("pass-length");
    const passNum = document.getElementById("pass-num");
    const passLowerCase = document.getElementById("pass-lowercase");
    const passUpperCase = document.getElementById("pass-uppercase");
    const passSpecialCase = document.getElementById("pass-specialcase");

    const textSuccess = "text-success";

    // Requirements
    const lengthRequirement = 8;
    const uppercaseRequirement = 1;
    const lowercaseRequirement = 1;
    const digitRequirement = 1;
    const symbolRequirement = 1;

    const addError = (el) => {
      el.classList.add("text-error");
      el.classList.remove(textSuccess);
    };

    const removeError = (el) => {
      el.classList.add(textSuccess);
      el.classList.remove("text-error");
    };

    const checkCondition = (condition, el) => {
      return condition ? addError(el) : removeError(el);
    };

    // Check password length
    checkCondition(password.length < lengthRequirement, passLength);

    // Check for lowercase letters
    checkCondition(
      (password.match(/[a-z]/g) || []).length < lowercaseRequirement,
      passLowerCase
    );

    // Check for uppercase letters
    checkCondition(
      (password.match(/[A-Z]/g) || []).length < uppercaseRequirement,
      passUpperCase
    );

    // Check for digits
    checkCondition(
      (password.match(/[0-9]/g) || []).length < digitRequirement,
      passNum
    );

    // Check for symbols
    checkCondition(
      (password.match(/[^a-zA-Z0-9]/g) || []).length < symbolRequirement,
      passSpecialCase
    );
  };

  return (
    <>
      <Modal
        centered
        open={openResetPasswordModal}
        footer={null}
        width={400}
        onCancel={handleClose}
        className="prompt"
      >
        <Row className="flex justify-center w-full items-center">
          <div className="bg-white h-fit ">
            <div>
              <div className="flex flex-col items-center mb-6">
                <Row className="mb-4 text-center">
                  <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl">
                    {fromNewUser ? "Create a New" : "Reset"} Password
                  </h2>
                </Row>
                <CustomDivider color={isbuyer && "#00CFE1"} />
                {/* <Row>
                  <p className="text-neutral-3 my-0 text-base text-center font-sharp-sans-medium">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </Row> */}
              </div>
              <Form form={form} layout="vertical" onFinish={handleFinish}>
                <Col xs={24} className="mb-6 w-full">
                  <CustomFormItem
                    label="New Password"
                    name="password"
                    required
                    mb="0"
                    rules={config.requiredRule}
                  >
                    <Input
                      className="text-neutral-2 font-sharp-sans-semibold bg-white flex w-full rounded py-2 text-base"
                      type={showPassword}
                      suffix={renderSuffixIcon("pass")}
                      onChange={handleCheckNewPassword}
                    />
                  </CustomFormItem>
                  <div>
                    <ul className={`pl-4 font-sharp-sans mt-1 text-xxs`}>
                      <li id="pass-length">eight characters minimum</li>
                      <li id="pass-num">one number</li>
                      <li id="pass-lowercase">one lowercase letter</li>
                      <li id="pass-uppercase">one uppercase letter</li>
                      <li id="pass-specialcase">one special character</li>
                    </ul>
                  </div>
                </Col>
                <CustomFormItem
                  label="Confirm Password"
                  name="password_confirmation"
                  required
                  mb="6"
                  rules={config.requiredRule}
                >
                  <Input
                    className="text-neutral-2 font-sharp-sans-semibold bg-white flex w-full rounded py-2 text-base"
                    type={showConfirmPassword}
                    suffix={renderSuffixIcon("confirm_pass")}
                  />
                </CustomFormItem>
                <Form.Item className="mb-0">
                  <CustomButton
                    label="Create Password"
                    isfullwidth={true}
                    htmlType="submit"
                    disabled={isLoading}
                    isloading={isLoading.toString()}
                    isbuyer={isbuyer}
                  />
                </Form.Item>
              </Form>
            </div>
          </div>
        </Row>
      </Modal>
      <Modal
        centered
        open={openSuccessModal}
        footer={null}
        width={400}
        closable={false}
        className="prompt"
      >
        <Row className="flex justify-center w-full items-center">
          <div className="bg-white h-fit">
            <div>
              <div className="flex flex-col items-center">
                <Row className="mb-4">
                  <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl">
                    Password is Reset
                  </h2>
                </Row>
                <CustomDivider color={isbuyer && "#00CFE1"} />
                {/* <Row className="mb-6">
                  <p className="text-neutral-3 my-0 text-base text-center">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </Row> */}
                <Row className="mt-6">
                  <CustomButton
                    label="Continue"
                    isfullwidth={true}
                    onClick={handleContinue}
                    disabled={isLoading}
                    isloading={isLoading.toString()}
                    isbuyer={isbuyer}
                  />
                </Row>
              </div>
            </div>
          </div>
        </Row>
      </Modal>
    </>
  );
};

export default ResetPasswordModal;
