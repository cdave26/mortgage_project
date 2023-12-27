import React, { useEffect, useState } from "react";
import { Col, Form, Radio, Row, Skeleton } from "antd";
import Link from "next/link";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";

import {
  getCountiesPerStateAction,
  resetCountyAction,
} from "~/store/county/action";
import { setSpinningAction } from "~/store/ui/action";
import { condoTypes, verifiedByOptions } from "~/utils/listing";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import { automateURL } from "~/plugins";
import { parseToDecimal, removeNonIntegers } from "~/plugins/formatNumbers";
import {
  createAgentListingAction,
  setAgentListingStatesAction,
} from "~/store/publicstore/action";
import { verifyReCaptcha } from "~/store/publicstore/api";

import CustomDivider from "~/components/base/CustomDivider";
import CustomFormItem from "~/components/base/CustomFormItem";
import CustomInput from "~/components/base/CustomInput";
import CustomButton from "~/components/base/CustomButton";
import CustomInputNumber from "~/components/base/CustomInputNumber";
import SectionFormContainer from "~/components/base/SectionFormContainer";
import CustomSelect from "~/components/base/CustomSelect";
import LoanOfficerDetails from "~/components/base/LoanOfficerDetails";
import AgentListingInquiryModal from "./InquiryModal";
import AgentListingSuccess from "./Success";

const baseRoute = "/listing";

const AgentListingComponent = () => {
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const {
    loanOfficerData,
    counties,
    loadingCounties,
    propertyTypes,
    numberOfUnits,
    licenseStatesPerUserList,
    loadinglicenseStatesPerUser,
  } = useSelector((state) => {
    return {
      loanOfficerData: state.publicStore.publicAgentListing.loanOfficerData,
      counties: state.counties.countiesPerState.data,
      loadingCounties: state.counties.countiesPerState.loading,
      propertyTypes: state.propertyType.items,
      numberOfUnits: state.numberOfUnits.data,
      licenseStatesPerUserList: state.licenses.licenseStatesPerUser.data,
      loadinglicenseStatesPerUser: state.licenses.licenseStatesPerUser.loading,
    };
  }, shallowEqual);

  useEffect(() => {
    if (numberOfUnits.length) {
      form.setFields([
        { name: "units_count", value: { value: "OneUnit", label: "One Unit" } },
        {
          name: "credit_verified_by",
          value: { value: "Listing Agent", label: "Listing Agent" },
        },
      ]);
    }
  }, [numberOfUnits]);

  //   // CREATE
  useEffect(() => {
    if (loanOfficerData && Object.keys(loanOfficerData).length) {
      const { first_name, last_name, email, mobile_number } = loanOfficerData;
      const formatted = {
        loan_officer: `${first_name} ${last_name}`,
        email,
        mobile_number,
      };

      for (const key in formatted) {
        form.setFields([
          {
            name: key,
            value: formatted[key],
          },
        ]);
      }
    }
  }, [loanOfficerData]);

  const checkIsUpdate = () => {
    return false;
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

  const handleCaptchaSubmission = async (token) => {
    if (!token) {
      setIsVerified(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const response = await verifyReCaptcha({ token }, signal);

    if (response && response.status === 200) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };

  const convertFloat = (val, isPercent) =>
    parseToDecimal(val, isPercent ? 1 : 3);

  const checkNaNVal = (val, isPercent = false) => {
    return !val || isNaN(val) ? 0 : convertFloat(val, isPercent);
  };

  const formatSubmitData = async (values) => {
    const selectedState = licenseStatesPerUserList.filter(
      (state) => state.value === values.property_state.value
    );

    const selectedCounty = counties.filter(
      (state) => state.value === values.property_county.value
    );

    const selectedLicense = licenseStatesPerUserList.filter(
      (state) => state.value === values.user_license_state.value
    );

    const defaultDownPercent = 20;
    const propertyValue = values.property_value;
    const calculatedDownPayment = (defaultDownPercent * propertyValue) / 100;
    const calculatedLoanAmount = propertyValue - calculatedDownPayment;

    return {
      ...values,
      state_id: selectedState[0].state_id,
      county_id: selectedCounty[0].key,
      user_license_id: selectedLicense[0].key,
      property_type: values.property_type.value,
      property_value: propertyValue,
      seller_credits: values.seller_credits ?? 0, //set to 0 by default
      default_down_payment: defaultDownPercent, // set to 20%
      loan_amount: calculatedLoanAmount,
      hoa_dues: checkNaNVal(values.hoa_dues),
      property_taxes: checkNaNVal(values.property_taxes),
      homeowners_insurance: 0,
      units_count: values.units_count.value,
      listing_status: "agent_draft",
      credit_verified_by: values.credit_verified_by.value, //set to listing agent
      usda_lookup: false,
      fha_condo_lookup: values.fha_condo_lookup ?? true,
      va_condo_lookup: values.va_condo_lookup ?? true,
    };
  };

  const handleFinish = async (values) => {
    dispatch(setSpinningAction(true));
    setIsLoading(true);

    const controller = new AbortController();
    const { signal } = controller;

    const {
      id: userId,
      company_id: companyId,
      url_identifier: urlIdentifier,
    } = loanOfficerData;

    const formattedSubmitData = await formatSubmitData(values);

    try {
      const formatted = {
        ...values,
        ...formattedSubmitData,
        page_link: `${baseRoute}/${urlIdentifier}-mls${values.mls_number}`,
        user_id: userId,
        company_id: companyId,
        agent_listing: true, // to trigger email notification in BE
      };

      const response = await createAgentListingAction(formatted, signal);
      if (response.status === 200) {
        dispatch(
          setAgentListingStatesAction({
            successMessage: response.data.message,
            showSuccessModal: true,
          })
        );
      }
    } catch (error) {
      onHandleError(error, dispatch);
      setIsLoading(false);
    } finally {
      dispatch(setSpinningAction(false));
    }
  };

  const handleCountyChange = () => {
    form.resetFields(["property_zip"]);
  };

  const handleSelectUserLicenseState = (opt) => {
    const filtered = licenseStatesPerUserList.find(
      (license) => license.value === opt?.value
    );

    if (!filtered) {
      resetCountyAction(dispatch);
      form.resetFields([
        "user_license_state",
        "license_state",
        "user_license_id",
        "property_state",
        "property_county",
        "property_zip",
      ]);
      return;
    }

    dispatch(getCountiesPerStateAction(filtered.state_id));

    form.resetFields(["property_county", "property_zip"]);
    form.setFields([
      { name: "license_state", value: filtered.value },
      { name: "user_license_id", value: filtered.license },
      { name: "user_license_state", value: filtered },
      { name: "property_state", value: filtered },
    ]);
  };

  const handleSelectPropertyType = (type) => {
    const isPropertyCondo = condoTypes.includes(type);

    setShowLookup(isPropertyCondo);

    form.setFields([
      { name: "va_condo_lookup", value: !isPropertyCondo },
      { name: "fha_condo_lookup", value: !isPropertyCondo },
    ]);
  };

  return (
    <>
      <div className="mx-auto w-full">
        <div className="flex justify-start items-start mb-3">
          <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
            Request a Listing Flyer
          </h2>
        </div>
        <CustomDivider />
        <div className="mt-7 mb-16">
          <Form
            layout="vertical"
            form={form}
            onFinish={handleFinish}
            scrollToFirstError={{ behavior: "smooth" }}
            onFinishFailed={() =>
              snackBar("Some fields requires your attention.", "", "error")
            }
          >
            <div>
              <SectionFormContainer label={"Subject Property Location"}>
                <Col className="flex md:gap-4 w-full flex-col md:flex-row mb-4">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="State"
                      name="user_license_state"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                      mb="0"
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select State"
                          options={licenseStatesPerUserList}
                          disabled={loadinglicenseStatesPerUser}
                          onChange={(opt) => handleSelectUserLicenseState(opt)}
                          withsearch="true"
                          statesearch="true"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full"></div>
                </Col>
              </SectionFormContainer>
            </div>
            <div>
              <SectionFormContainer label={"Property Info"}>
                <Col className="flex md:gap-4 w-full flex-col md:flex-row">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="MLS Number"
                      name="mls_number"
                      required
                      rules={config.requiredRule}
                      footnote="Provide unique number assigned by the MLS System"
                      mb="4"
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter MLS Number"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="MLS Link"
                      name="mls_link"
                      // rules={config.urlRule}
                      footnote="(Optional) Website URL to MLS"
                      mb="4"
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          onKeyDown={(event) => {
                            if (
                              event.code === "Space" ||
                              event.keyCode === 32 ||
                              event.which === 32
                            ) {
                              event.preventDefault();
                            }
                          }}
                          onChange={(event) => {
                            automateURL(
                              event.target.value,
                              form,
                              "mls_link",
                              false
                            );
                          }}
                          placeholder="Enter MLS Link"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>
                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Address"
                      name="property_address"
                      required
                      rules={config.requiredRule}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" placeholder="Enter Address" />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Apt, Suite"
                      name="property_apt_suite"
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Apt, Suite"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="City"
                      name="property_city"
                      required
                      rules={config.requiredRule}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" placeholder="Enter City" />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>
                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="State"
                      name="property_state"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select State"
                          options={licenseStatesPerUserList}
                          disabled={true}
                          onChange={(opt) => handleSelectUserLicenseState(opt)}
                          withsearch="true"
                          statesearch="true"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="County"
                      name="property_county"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select County"
                          options={counties}
                          disabled={loadingCounties}
                          onChange={handleCountyChange}
                          withsearch="true"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Zip"
                      name="property_zip"
                      required
                      rules={[
                        ...config.requiredRule,
                        {
                          pattern: "^[0-9]*$",
                          message: "This field must be numeric.",
                        },
                      ]}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" placeholder="Enter Zip" />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>

                <Col className="flex justify-center flex-col md:flex-row md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Property Type"
                      name="property_type"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                      mb={`${showLookup ? "4" : "6"}`}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select Type"
                          options={propertyTypes}
                          disabled={!propertyTypes.length}
                          onChange={(opt) =>
                            handleSelectPropertyType(opt?.value)
                          }
                        />
                      )}
                    </CustomFormItem>

                    {showLookup ? (
                      <div className="flex justify-center flex-col md:flex-row gap-4 w-full mb-[10px]">
                        {/* <div className="flex-1 w-full">
                          <CustomFormItem
                            label="USDA Lookup"
                            name="usda_lookup"
                            required
                            initialValue={true}
                            mb="0"
                            rules={config.requiredRule.slice(0, 1)}
                            disabled
                          >
                            <Radio.Group disabled>
                              <Radio value={true}>Yes</Radio>
                              <Radio value={false}>No</Radio>
                            </Radio.Group>
                          </CustomFormItem>
                          <div>
                            <Link
                              href={config.lookupLinks.usda_lookup}
                              className="text-xanth font-sharp-sans-bold text-xs underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View USDA Lookup
                            </Link>
                          </div>
                        </div> */}
                        <div className="flex-1 w-full">
                          <CustomFormItem
                            label="FHA Approved"
                            name="fha_condo_lookup"
                            required
                            mb="0"
                            initialValue={true}
                            rules={config.requiredRule.slice(0, 1)}
                          >
                            <Radio.Group>
                              <Radio value={true}>Yes</Radio>
                              <Radio value={false}>No</Radio>
                            </Radio.Group>
                          </CustomFormItem>
                          <div>
                            <Link
                              href={config.lookupLinks.fha_condo_lookup}
                              className="text-xanth font-sharp-sans-bold text-xs underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              FHA Condo Lookup
                            </Link>
                          </div>
                        </div>
                        <div className="flex-1 w-full">
                          <CustomFormItem
                            label="VA Approved"
                            name="va_condo_lookup"
                            required
                            mb="0"
                            initialValue={true}
                            rules={config.requiredRule.slice(0, 1)}
                          >
                            <Radio.Group>
                              <Radio value={true}>Yes</Radio>
                              <Radio value={false}>No</Radio>
                            </Radio.Group>
                          </CustomFormItem>
                          <div>
                            <Link
                              href={config.lookupLinks.va_condo_lookup}
                              className="text-xanth font-sharp-sans-bold text-xs underline"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              VA Condo Lookup
                            </Link>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Number of Units"
                      name="units_count"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select Number of Units"
                          options={numberOfUnits}
                          disabled={!numberOfUnits.length}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>

                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="List Price($)"
                      name="property_value"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          type="currency"
                          placeholder="Enter List Price"
                          precision={0}
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Seller Credits($)"
                      name="seller_credits"
                      initialValue={0}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          type="currency"
                          placeholder="Enter Seller Credits"
                          precision={0}
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Credit Verified By"
                      name="credit_verified_by"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select a Name"
                          options={verifiedByOptions}
                          disabled
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>

                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="HOA Dues ($/month)"
                      name="hoa_dues"
                      initialValue={0}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          type="currency"
                          placeholder="Enter Amount"
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Property Taxes ($/month)"
                      name="property_taxes"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          type="currency"
                          placeholder="Enter Property Taxes"
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>
                <Col className="flex md:gap-4 w-full flex-col md:flex-row">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Listing Agent"
                      name="listing_agent_name"
                      required
                      rules={config.requiredRule}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Listing Agent"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Listing Agent Email"
                      name="listing_agent_email"
                      required
                      rules={[
                        ...config.requiredRule,
                        {
                          type: "email",
                          message: "Email address must be valid.",
                        },
                      ]}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Listing Agent Email"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>
              </SectionFormContainer>

              <SectionFormContainer label={""}>
                <Col className="flex justify-center flex-col md:flex-row md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Officer"
                      name="loan_officer"
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" disabled />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Officer Contact Email"
                      name="email"
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" disabled />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Officer Contact Number"
                      name="mobile_number"
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" disabled />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>
              </SectionFormContainer>
            </div>

            <div className="w-full flex flex-col items-center mt-6 gap-3">
              <div className="mb-4">
                <ReCAPTCHA
                  sitekey={config.recaptcha.siteKey}
                  onChange={handleCaptchaSubmission}
                />
              </div>
              <div
                className={`w-full lg:w-auto ${
                  !isVerified ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <CustomButton
                  className={`${!isVerified && "pointer-events-none"}`}
                  htmlType="submit"
                  label={"Submit"}
                  isfullwidth={true}
                  disabled={isLoading}
                  isloading={isLoading.toString()}
                />
              </div>
            </div>
          </Form>
        </div>
        {Object.keys(loanOfficerData).length && (
          <div className="max-w-[834px] w-full mx-auto px-5">
            <Row className="w-full mx-auto">
              <div className="mb-2 text-center w-full text-center">
                <p className="my-0 text-neutral-1 text-base font-sharp-sans-bold">
                  Contact Me
                </p>
              </div>
              <div className="bg-gray-2 w-full mx-auto flex justify-center items-center flex-col border border-solid border-alice-blue rounded-lg p-8">
                <LoanOfficerDetails userData={loanOfficerData} />
                <div className="flex gap-4 flex-row flex-wrap items-center justify-center">
                  {isMobileDevice && loanOfficerData?.mobile_number && (
                    <>
                      <CustomButton
                        iscalltoaction
                        label="Call"
                        type="link"
                        href={`tel:${removeNonIntegers(
                          loanOfficerData?.mobile_number
                        )}`}
                      />
                      <CustomButton
                        iscalltoaction
                        label="Text"
                        type="link"
                        href={`sms:${removeNonIntegers(
                          loanOfficerData?.mobile_number
                        )}`}
                      />
                    </>
                  )}
                  <CustomButton
                    iscalltoaction
                    label="Email"
                    onClick={() =>
                      dispatch(
                        setAgentListingStatesAction({ showInquiryModal: true })
                      )
                    }
                  />
                </div>
              </div>
            </Row>
            <Row className="mt-10 pb-16 flex justify-center">
              <div className="w-20 h-20">
                <img
                  src={`${window.location.origin}/icon/${loanOfficerData?.company?.equal_housing}.png`}
                  alt={`${loanOfficerData?.company?.equal_housing}-logo-png-transparent`}
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>
            </Row>
          </div>
        )}
        <AgentListingInquiryModal />
        <AgentListingSuccess />
      </div>
    </>
  );
};
export default AgentListingComponent;
