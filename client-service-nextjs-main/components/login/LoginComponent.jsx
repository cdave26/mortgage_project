import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { EyeInvisibleFilled, EyeFilled } from "@ant-design/icons";
import { Button, Checkbox, Col, Form, Input, Modal, Row, Grid } from "antd";
import { useRouter } from "next/router";
import * as jose from "jose";

import { getCookie, login } from "~/store/auth/api";
import {
  onOpenForgotPasswordModal,
  onOpenOtpModal,
  onOpenResetPasswordModal,
  onSetUserEmail,
} from "~/store/auth/action";
import { getHubspotCompany, getHubspotContact } from "~/store/hubspot/api";
import { processContact, successCheckout } from "~/store/stripe/api";

import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import { AUTH } from "~/store/auth/type";
import userTypes from "~/enums/userTypes";
import ipify from "~/utils/ipify";

import CustomButton from "../base/CustomButton";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomDivider from "../base/CustomDivider";

import ResetPasswordModal from "../reset-password/ResetPasswordModal";
import ForgotPasswordModal from "../forgot-password/ForgotPasswordModal";
import VerificationOtpModal from "../verification/VerificationOtpModal";

const LoginComponent = (props) => {
  const { companyName } = props;
  const [showPassword, setShowPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [hasTerms, setHasTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const company = useSelector((state) => state.company.companyLogoDetails);

  const router = useRouter();
  const queries = router.query;

  const errorTimeout = 2000;

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const controller = new AbortController();
  const { signal } = controller;

  const removeHubspotIds = () => {
    window.localStorage.removeItem("stripeSessionId");
    window.localStorage.removeItem("hubspotCompanyId");
    window.localStorage.removeItem("hubspotContactId");
    window.localStorage.removeItem("hubspotCompany");
  };

  const handleError = (error) => {
    setIsLoading(false);
    removeHubspotIds();

    if (error.response && error.response.status === 422) {
      setErrorMsg(error.response.data.message);
      return;
    }

    setOpenSuccessModal(false);
    onHandleError(error, dispatch);
    setTimeout(() => {
      window.location.href = "/login";
    }, errorTimeout);
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

  const handleFunction = (func, param) => {
    getCookie()
      .then(() => {
        func(param, signal)
          .then(() => {
            setIsLoading(false);
          })
          .catch((err) => {
            handleError(err);
          });
      })
      .catch((err) => handleError(err));
  };

  // type 2 and type 3 account
  const handleSuccessCheckout = () => {
    if (!queries.companyId) {
      snackBar(
        "Company not found. Please contact your administrator.",
        "",
        "error"
      );
      setIsLoading(false);
      setOpenSuccessModal(false);
      window.localStorage.removeItem("hubspotCompany");
      return;
    }

    window.localStorage.setItem("stripeSessionId", queries.session_id);
    window.localStorage.setItem("hubspotCompanyId", queries.companyId);

    if (queries.contactId) {
      window.localStorage.setItem("hubspotContactId", queries.contactId);
    }

    /**
     * TYPE 3
     */
    if (!queries.contactId) {
      window.location.href = "/register";
      return;

      /**
       * TYPE 2
       */
    } else {
      if (!queries.contactId) {
        snackBar(
          "Contact not found. Please contact your administrator.",
          "",
          "error"
        );
        setIsLoading(false);
        setOpenSuccessModal(false);
        window.localStorage.removeItem("hubspotCompany");
        return;
      }

      const query = {
        session_id: queries.session_id,
        company_id: queries.companyId,
        contact_id: queries.contactId,
      };

      /**
       * for Type 2 accounts that were registered inside the uplist web/enterprise app
       */
      if (queries.enterpriseApp && queries.enterpriseApp === "true") {
        query.enterprise_app = true;
      }

      handleFunction(successCheckout, query);
    }
  };

  const checkHubspotContact = () => {
    const query = {
      contact_id: queries.contactId,
    };

    getHubspotContact(query)
      .then((res) => {
        snackBar(res.data.message, "", "success");

        const query = {
          contact_id: queries.contactId,
          company_id: queries.companyId,
        };

        window.localStorage.setItem("hubspotCompanyId", queries.companyId);
        window.localStorage.setItem("hubspotContactId", queries.contactId);

        handleFunction(processContact, query);
      })
      .catch((err) => handleError(err));
  };

  const checkHubspotCompany = () => {
    getCookie().then(() => {
      getHubspotCompany({
        company_id: queries.companyId,
        billing_type: "enterprise",
      })
        .then((res) => {
          snackBar(res.data.message, "", "success");
          checkHubspotContact();
        })
        .catch((err) => handleError(err));
    });
  };

  // type 1 account
  const handleProcessContact = () => {
    setHasTerms(false);
    if (!queries.companyId || !queries.contactId) {
      snackBar(
        "Company not found. Please contact your administrator.",
        "",
        "error"
      );
      setIsLoading(false);
      setHasTerms(false);
      setOpenSuccessModal(false);

      setTimeout(() => {
        window.location.href = "/login";
      }, errorTimeout);
      return;
    }

    setHasTerms(false);
    checkHubspotCompany();
  };

  const getHeaderText = () => {
    if (hasTerms) {
      return "Review Privacy Policy and Terms and Conditions";
    }

    if (errorMsg) return "Processing Failed";

    if (queries.res === "success-checkout") {
      return isLoading ? "Processing Checkout" : "Checkout Success";
    }

    if (queries.res === "process-contact") {
      return isLoading ? "Processing" : "Processing Success";
    }

    return "";
  };

  const getBodyContent = () => {
    const tempPasswordMsg = "We’ve sent you a temporary password";

    if (errorMsg) return errorMsg;

    if (queries.res === "success-checkout") {
      return isLoading ? "" : tempPasswordMsg;
    }

    if (queries.res === "process-contact") {
      return isLoading ? "" : tempPasswordMsg;
    }

    return "";
  };

  const handleContinue = () => {
    if (hasTerms) {
      setIsLoading(true);
      handleProcessContact();
    } else {
      setOpenSuccessModal(false);

      window.location.href = "/login";
    }
  };

  useEffect(() => {
    /**
     * TYPE 2
     * {PRODUCTION_URL}/pricing?res=checkout&companyId={HUBSPOT_COMPANY_ID}&contactId={HUBSPOT_CONTACT_ID}
     *
     * TYPE 3
     * {PRODUCTION_URL}/pricing?res=checkout&companyId={HUBSPOT_COMPANY_ID}
     */
    if (queries.res === "success-checkout" && queries.companyId) {
      setIsLoading(true);
      setOpenSuccessModal(true);
      handleSuccessCheckout();
    }

    /**
     * TYPE 1
     * {PRODUCTION_URL}/login?res=process-contact&companyId={HUBSPOT_COMPANY_ID}&contactId={HUBSPOT_CONTACT_ID}
     */
    if (queries.res === "process-contact") {
      setIsLoading(true);
      setHasTerms(true);
      setOpenSuccessModal(true);
    }
  }, []);

  const renderSuffixIcon = () => {
    return showPassword === "password" ? (
      <EyeFilled onClick={handleShow} />
    ) : (
      <EyeInvisibleFilled onClick={handleShow} />
    );
  };

  const handleShow = () => {
    setShowPassword("password" === showPassword ? "text" : "password");
  };

  /**
   * Handle form submit
   *
   * @param {Object} values
   * @returns {void}
   */
  const handleFinish = ({ username, password }) => {
    setIsLoading(true);

    getCookie()
      .then(async () => {
        const controller = new AbortController();
        const { signal } = controller;
        const ip = await ipify();
        login(
          {
            email: username,
            password,
            company: company.id,
            ip,
          },
          signal
        )
          .then(async (res) => {
            if (res.data.success) {
              if (res.data.user.iscomplete_onboarding === 1) {
                const onboarding = localStorage.getItem("onboarding");
                if (onboarding) {
                  const onboardingUser = JSON.parse(onboarding);
                  const userIndex = onboardingUser.findIndex(
                    (item) => item.id === res.data.user.id
                  );
                  if (userIndex == -1) {
                    localStorage.setItem(
                      "onboarding",
                      JSON.stringify([
                        ...onboardingUser,
                        {
                          id: res.data.user.id,
                          step: 1,
                        },
                      ])
                    );
                  }
                } else {
                  localStorage.setItem(
                    "onboarding",
                    JSON.stringify([
                      {
                        id: res.data.user.id,
                        step: 1,
                      },
                    ])
                  );
                }
              }
              onSetUserEmail(res.data.user.email, dispatch);

              dispatch({
                type: AUTH.userMobileNumber,
                mobile_number: res.data.user.mobile_number,
              });

              const secret = new TextEncoder().encode(config.securityApp);
              const token = await new jose.SignJWT({ userData: res.data.user })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .sign(secret);

              localStorage.setItem("user", token);
              localStorage.setItem("login", location.pathname);

              const userType = res.data.user.user_type;

              dispatch({
                type: AUTH.userType,
                user_type: userType,
              });

              if (res.data.user.first_time_login) {
                onOpenResetPasswordModal(true, dispatch);
                setIsLoading(false);
                return;
              } else {
                if (res.data.user?.trusted) {
                  handleTokenService(
                    token,
                    dispatch,
                    userType.id === userTypes.BUYER
                  );
                  return;
                }
                setIsLoading(false);
                onOpenOtpModal(true, dispatch);
              }
            }
          })
          .catch((err) => {
            setIsLoading(false);
            return onHandleError(err, dispatch);
          });
      })
      .catch((err) => {
        setIsLoading(false);
        return onHandleError(err, dispatch);
      });
  };

  const handleTokenService = (token, dispatch, buyer) => {
    onSetUplistCookies(token, null, buyer)
      .then(() => {
        snackBar("Authentication Successful.", "", "success");
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        onHandleError(error, dispatch);
      });
  };

  return (
    <Row className="h-full">
      <Col xs={24} sm={24} md={24} lg={24}>
        <Row className="items-center" gutter={[16, 25]} justify={"center"}>
          <Col sm={24} md={12} lg={12}>
            <Row className="mb-4">
              <h1 className="text-5xl text-denim my-0 font-sharp-sans-bold">
                Sign in {companyName ? "" : "to Uplist"}
              </h1>
            </Row>
            <CustomDivider />
            <Row className="mb-8">
              <p className="text-neutral-2 my-0 font-sharp-sans-medium leading-7">
                Welcome! Sign in with your company provided information.
              </p>
            </Row>
            <Row>
              <CustomButton
                label="Contact Customer Support"
                iscalltoaction
                type="primary"
                href={config.marketingUrl}
                target="_blank"
                rel="noopener noreferrer"
              />
            </Row>
            <Row>
              <p
                hidden={companyName}
                className="text-neutral-4 mt-3 text-xs font-sharp-sans-medium leading-7"
              >
                For buyers, kindly use the login link provided by your loan
                officer.
              </p>
            </Row>
          </Col>
          <Col sm={24} md={12} lg={12}>
            <Row className="xs:px-2 sm:px-0 lg:px-12">
              <Col
                className="bg-white shadow-default p-10 rounded-3xl my-10"
                span={24}
              >
                <Form layout="vertical" form={form} onFinish={handleFinish}>
                  <CustomFormItem
                    label="Company email or Username"
                    name="username"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput type="text" />
                  </CustomFormItem>
                  <CustomFormItem
                    label="Password"
                    name="password"
                    required
                    rules={config.requiredRule}
                  >
                    <Input
                      className="text-neutral-2 text-base font-sharp-sans-semibold bg-white w-full rounded py-2"
                      type={showPassword}
                      suffix={renderSuffixIcon()}
                    />
                  </CustomFormItem>
                  <div className="text-right mb-6">
                    <Button
                      type="link"
                      className={`text-xanth font-sharp-sans-bold p-0`}
                      onClick={() => onOpenForgotPasswordModal(true, dispatch)}
                      disabled={isLoading}
                    >
                      Forgot Password?
                    </Button>
                  </div>
                  <Form.Item>
                    <CustomButton
                      label="Login"
                      isfullwidth={true}
                      htmlType="submit"
                      disabled={isLoading}
                      isloading={isLoading.toString()}
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Col>
        </Row>
        <Modal
          centered
          open={openSuccessModal}
          footer={null}
          width={400}
          closable={false}
          className="prompt"
        >
          <Row className="flex justify-center w-full items-center">
            <div className="bg-white h-fit w-full">
              <div>
                <div className="flex flex-col items-center">
                  <Row className="mb-4">
                    <h2
                      className={`${
                        errorMsg ? "text-error" : "text-denim"
                      } my-0 font-sharp-sans-bold text-3xl text-center`}
                    >
                      {getHeaderText()}
                    </h2>
                  </Row>
                  <CustomDivider />
                  <Row className="w-full">
                    <p className="text-neutral-3 my-0 text-base text-center w-full">
                      {getBodyContent()}
                    </p>
                  </Row>
                  {hasTerms && (
                    <Row className="mt-4">
                      <Checkbox
                        onChange={(e) => setIsLoading(!e.target.checked)}
                        className="login-toc-checkbox font-sharp-sans-medium text-neutral-3"
                      >
                        I accept the{" "}
                        <a
                          href={config.privacyPolicyUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="text-xanth"
                        >
                          Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a
                          href={config.termsOfServiceUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="text-xanth"
                        >
                          Terms of Services
                        </a>
                      </Checkbox>
                    </Row>
                  )}
                  <Row className="mt-6">
                    <CustomButton
                      label="Continue"
                      disabled={isLoading}
                      isloading={isLoading.toString()}
                      onClick={handleContinue}
                    />
                  </Row>
                </div>
              </div>
            </div>
          </Row>
        </Modal>
        <ResetPasswordModal />
        <ForgotPasswordModal />
        <VerificationOtpModal />
      </Col>
    </Row>
  );
};

export default LoginComponent;
