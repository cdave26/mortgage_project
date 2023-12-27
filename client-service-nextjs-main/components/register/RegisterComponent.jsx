import React, { useEffect, useState, useRef } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Col, Form, Modal, Row } from "antd";
import { useRouter } from "next/router";

import { getCookie } from "~/store/auth/api";
import { onHandleError } from "~/error/onHandleError";
import { processHubspotWithoutContact } from "~/store/stripe/api";

import CustomButton from "../base/CustomButton";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomDivider from "../base/CustomDivider";
import config from "~/config";
import { onMobileNumber } from "~/lib/events";
import { validateMobileNumber } from "~/plugins/mobileNumber";
import CustomSelect from "../base/CustomSelect";

const RegisterComponent = () => {
  const submitButton = useRef(null);
  const { loadingPrice, price } = useSelector((state) => {
    return {
      loadingPrice: state.pricingEngine.pricing.loading,
      price: state.pricingEngine.pricing.data,
    };
  }, shallowEqual);

  const [isLoading, setIsLoading] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [hubspotCompanyData, setHubspotCompanyData] = useState({});
  const dispatch = useDispatch();
  const router = useRouter();

  const [form] = Form.useForm();
  const controller = new AbortController();
  const { signal } = controller;

  const removeHubspotIds = () => {
    window.localStorage.removeItem("stripeSessionId");
    window.localStorage.removeItem("hubspotCompanyId");
    window.localStorage.removeItem("hubspotCompany");
    setHubspotCompanyData({});
  };

  const handleFinish = (values) => {
    const param = {
      ...values,
      pricing_engine_id: values.pricing_engine_id.value,
      session_id: window.localStorage.getItem("stripeSessionId"),
      company_id: window.localStorage.getItem("hubspotCompanyId"),
    };

    setIsLoading(true);
    setOpenSuccessModal(true);
    getCookie()
      .then(() => {
        processHubspotWithoutContact(param, signal)
          .then(() => {
            setIsLoading(false);
          })
          .catch((err) => {
            onHandleError(err, dispatch);
            setIsLoading(false);
            setOpenSuccessModal(false);
          });
      })
      .catch((err) => {
        onHandleError(err, dispatch);
        setIsLoading(false);
        setOpenSuccessModal(false);
        removeHubspotIds();
      });
  };

  const handleContinue = () => {
    removeHubspotIds();
    setOpenSuccessModal(false);

    setTimeout(() => {
      router.push("/login");
    }, 750);
  };

  useEffect(() => {
    if (!window.localStorage.getItem("hubspotCompanyId")) {
      window.localStorage.removeItem("hubspotCompany");
      dispatch({
        type: "UI/snackbars",
        payload: {
          open: true,
          message: "Error",
          description: "Company not found. Please contact your administrator.",
          position: "topRight",
          type: "error",
        },
      });

      router.push("/");
      return;
    }

    if (window.localStorage.getItem("hubspotCompany")) {
      setHubspotCompanyData(
        JSON.parse(window.localStorage.getItem("hubspotCompany"))
      );
    }
  }, []);

  return (
    <>
      <Row
        className="mx-auto justify-center h-full items-center"
        style={{ maxWidth: "60%" }}
      >
        <div className="w-full">
          <Col xs={24} className="flex justify-start items-start mb-6">
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
              User Details
            </h2>
          </Col>
          <CustomDivider />
          <Col xs={24} className="mt-12">
            <Form
              layout="vertical"
              form={form}
              className="mt-5"
              onFinish={handleFinish}
            >
              <Col className="flex justify-center items-center gap-4 w-full">
                <div className="flex-1">
                  <CustomFormItem
                    label="First Name"
                    name="first_name"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput type="text" />
                  </CustomFormItem>
                </div>
                <div className="flex-1">
                  <CustomFormItem
                    label="Last Name"
                    name="last_name"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput type="text" />
                  </CustomFormItem>
                </div>
              </Col>

              {Object.keys(hubspotCompanyData).length ? (
                <Col className="flex justify-start items-center w-full">
                  <Col className="flex-1 mb-6">
                    <div className="text-xs text-neutral-5 sharp-sans">
                      Company
                    </div>
                    <CustomInput
                      type="text"
                      disabled
                      placeholder={hubspotCompanyData.name}
                    />
                  </Col>
                </Col>
              ) : (
                <></>
              )}

              <Col className="flex justify-center items-center gap-4 w-full">
                <div className="flex-1">
                  <CustomFormItem
                    label="Pricing Engine"
                    name="pricing_engine_id"
                    required
                    rules={[
                      {
                        required: true,
                        message: "Pricing engine is required.",
                      },
                    ]}
                  >
                    <CustomSelect
                      placeholder="Select Price Engine"
                      options={price}
                      disabled={loadingPrice}
                    />
                  </CustomFormItem>
                </div>
              </Col>

              <Col className="flex justify-center items-center gap-4 w-full">
                <div className="flex-1">
                  <CustomFormItem
                    label="Job Title"
                    name="job_title"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput type="text" />
                  </CustomFormItem>
                </div>
              </Col>

              <Col className="flex justify-center items-center gap-4 w-full">
                <div className="flex-1">
                  <CustomFormItem
                    label="Mobile Number"
                    name="mobile_number"
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
                          "mobile_number",
                          submitButton
                        )
                      }
                    />
                  </CustomFormItem>
                </div>
              </Col>

              <Col className="flex justify-center items-center gap-4 w-full">
                <div className="flex-1">
                  <CustomFormItem
                    label="NMLS Number"
                    name="nmls_num"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput type="text" />
                  </CustomFormItem>
                </div>
              </Col>

              <Col className="flex justify-center items-center gap-4 w-full">
                <div className="flex-1">
                  <CustomFormItem
                    label="Email Address"
                    name="email"
                    required
                    rules={[
                      ...config.requiredRule,
                      {
                        type: "email",
                        message: "Email address must be valid.",
                      },
                    ]}
                  >
                    <CustomInput type="email" />
                  </CustomFormItem>
                </div>
              </Col>

              <Col className="flex justify-start items-center w-full">
                <div className="flex-1 mb-6">
                  <p className="text-xs text-neutral-4 font-sharp-sans-semibold mb-1 mt-0">
                    User URL Identifier
                  </p>
                  <CustomInput
                    type="text"
                    disabled={true}
                    placeholder="us1000002"
                  />
                  <p
                    style={{ fontSize: "10px" }}
                    className="text-neutral-3 font-sharp-sans mb-0 mt-1"
                  >
                    https://uplist.co/base/listing/us1xxxxxx-mlsxxxxx/
                  </p>
                </div>
              </Col>

              <Col className="w-full flex flex-row-reverse mt-4 gap-3">
                <Col className="mb-7" style={{ width: "200px" }}>
                  <CustomButton
                    label="Submit"
                    htmlType="submit"
                    isfullwidth={true}
                    disabled={isLoading}
                    isloading={isLoading.toString()}
                    ref={submitButton}
                  />
                </Col>
              </Col>
            </Form>
          </Col>
        </div>
      </Row>
      <Modal
        centered
        open={openSuccessModal}
        footer={null}
        width={400}
        closable={false}
      >
        <Row className="flex justify-center w-full items-center">
          <div className="bg-white h-fit">
            <div>
              <div className="flex flex-col items-center">
                <Row className="mb-4">
                  <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl">
                    {isLoading ? "Processing" : "Processing Success"}
                  </h2>
                </Row>
                <CustomDivider />
                {/* <Row>
                  <p className="text-neutral-3 my-0 text-base text-center">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  </p>
                </Row> */}
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
    </>
  );
};

export default RegisterComponent;
