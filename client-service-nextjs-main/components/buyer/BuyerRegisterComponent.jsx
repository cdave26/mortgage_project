import React, { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { EyeInvisibleFilled, EyeFilled } from "@ant-design/icons";
import { Col, Form, Input, Row } from "antd";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomButton from "../base/CustomButton";
import CustomDivider from "../base/CustomDivider";
import { registerBuyerAction } from "~/store/buyer/action";
import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { onHandleError } from "~/error/onHandleError";
import { useRouter } from "next/router";
import ipify from "~/utils/ipify";

const BuyerRegisterComponent = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState("password");
  const [showConfirmPassword, setShowConfirmPassword] = useState("password");
  const [passFormatError, setPassFormatError] = useState(false);
  const [form] = Form.useForm();
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  const { isLoading } = useSelector(({ buyer }) => {
    return {
      isLoading: buyer.isLoading,
    };
  }, shallowEqual);

  const company = useSelector((state) => state.company.companyLogoDetails);

  const handleFinish = async (values) => {
    const ip = await ipify();
    const response = await registerBuyerAction(
      {
        ...values,
        company: company.id,
        ip,
      },
      dispatch
    );

    localStorage.setItem("login", `/${router.query.companyName}/login`);

    const token = window.localStorage.getItem("user");

    try {
      if (response?.status === 200 && token) {
        onSetUplistCookies(token, null, true).then(() => {
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: "The password has been reset",
              position: "topRight",
              type: "success",
            },
          });
        });
      }
    } catch (error) {
      onHandleError(error, dispatch);
    }
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

  const passwordRequirements = {
    "pass-length": "eight characters minimum",
    "pass-num": "one number",
    "pass-lowercase": "one lowercase letter",
    "pass-uppercase": "one uppercase letter",
    "pass-specialcase": "one special character",
  };

  const renderSuffixIcon = (el) => {
    const passState = el === "pass" ? showPassword : showConfirmPassword;

    return passState === "password" ? (
      <EyeFilled onClick={() => handleShow(el)} />
    ) : (
      <EyeInvisibleFilled onClick={() => handleShow(el)} />
    );
  };

  const handleShow = (el) => {
    const show = el === "pass" ? setShowPassword : setShowConfirmPassword;
    const passState = el === "pass" ? showPassword : showConfirmPassword;
    show("password" === passState ? "text" : "password");
  };

  const validateMessages = {
    required: "This field is required",
  };

  return (
    <Row className="w-full content-center justify-center lg:justify-start bg-white mt-1">
      <Col xs={24} sm={24} md={24} lg={24} className="mb-1">
        <div
          className="bg-white shadow-default p-10 rounded-3xl"
          style={{ maxWidth: "400px", margin: "0 auto" }}
        >
          <Row className="mb-4" justify={"center"} align={"middle"}>
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
              Register
            </h2>
          </Row>
          <Row justify={"center"} align={"middle"}>
            <CustomDivider />
          </Row>
          <Row>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Form
                layout="vertical"
                form={form}
                onFinish={handleFinish}
                validateMessages={validateMessages}
              >
                <CustomFormItem
                  label="Username"
                  name="username"
                  required
                  rules={[{ required: true }]}
                >
                  <CustomInput type="text" placeholder="Enter Username" />
                </CustomFormItem>
                <div>
                  <p
                    className=" text-neutral-3 font-sharp-sans"
                    style={{ fontSize: "10px", marginTop: "-20px" }}
                  >
                    You may use your email address as username
                  </p>
                </div>
                <CustomFormItem
                  label="New Password"
                  name="password"
                  required
                  mb="0"
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value ||
                          passwordRegex.test(getFieldValue("password"))
                        ) {
                          setPassFormatError(false);
                          return Promise.resolve();
                        }
                        setPassFormatError(true);
                        return Promise.reject(
                          new Error(
                            "The password must meet the requirements below."
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input
                    className="text-neutral-2 font-sharp-sans-semibold bg-white flex w-full rounded py-2"
                    type={showPassword}
                    suffix={renderSuffixIcon("pass")}
                    placeholder="************"
                    onChange={handleCheckNewPassword}
                  />
                </CustomFormItem>
                <div>
                  <ul
                    className={`pl-4 ${
                      passFormatError ? "text-error" : "text-neutral-3"
                    } font-sharp-sans mt-1`}
                    style={{ fontSize: "10px" }}
                  >
                    {Object.entries(passwordRequirements).map(
                      ([id, requirement], index) => (
                        <li id={id} key={index}>
                          {requirement}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <CustomFormItem
                  label="Confirm Password"
                  name="password_confirmation"
                  required
                  mb="6"
                  dependencies={["password"]}
                  rules={[
                    { required: true },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "The password field confirmation does not match."
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input
                    className="text-neutral-2 font-sharp-sans-semibold bg-white flex w-full rounded py-2"
                    type={showConfirmPassword}
                    suffix={renderSuffixIcon("confirm_pass")}
                    placeholder="************"
                  />
                </CustomFormItem>
                <CustomFormItem
                  label="Code"
                  name="code"
                  required
                  rules={[{ required: true }]}
                >
                  <CustomInput type="text" placeholder="Enter Code" />
                </CustomFormItem>
                <div>
                  <p
                    className=" text-neutral-3 font-sharp-sans"
                    style={{ fontSize: "10px", marginTop: "-20px" }}
                  >
                    Please enter the code attached from your email
                  </p>
                </div>
                <Form.Item style={{ margin: 0 }}>
                  <CustomButton
                    label="Register"
                    isfullwidth={true}
                    htmlType="submit"
                    disabled={isLoading}
                    isloading={isLoading.toString()}
                  />
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </div>
      </Col>
    </Row>
  );
};
export default BuyerRegisterComponent;
