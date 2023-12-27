import React, { useEffect, useState } from "react";
import { Col, Form, Radio, Checkbox, Skeleton } from "antd";
import Link from "next/link";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import {
  createListingAction,
  updateListingAction,
} from "~/store/listing/action";
import { LISTINGS } from "~/store/listing/type";
import { condoTypes, publishable, verifiedByOptions } from "~/utils/listing";
import {
  getCountiesPerStateAction,
  resetCountyAction,
} from "~/store/county/action";
import {
  getLicenseStatesPerUserAction,
  resetUserLicenseStateAction,
} from "~/store/licenses/action";
import {
  getStatesPerCompanyAction,
  resetStateAction,
} from "~/store/state/action";
import {
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  setSpinningAction,
} from "~/store/ui/action";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import { getUsersPerCompanyAction } from "~/store/users/action";
import { USERS } from "~/store/users/type";
import { automateURL } from "~/plugins";
import { parseToDecimal } from "~/plugins/formatNumbers";

import CustomDivider from "../base/CustomDivider";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomButton from "../base/CustomButton";
import CustomInputNumber from "../base/CustomInputNumber";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import ListingConfirmUpdateComponent from "./ConfirmUpdateComponent";
import ListingStatusDescriptions from "./subcomponents/ListingStatusDescriptions";
import SectionFormContainer from "../base/SectionFormContainer";
import BackButton from "../base/buttons/BackButton";
import CustomSelect from "../base/CustomSelect";
import { find } from "lodash";

const baseRoute = "/listing";

const AddListing = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [editModal, showEditModal] = useState(false);
  const [toLicenses, setToLicenses] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredStatuses, setFilteredStatuses] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [isEligible, setIsEligible] = useState(false);
  const [hideForm, setHideForm] = useState(true);
  const [tempUpdated, setTempUpdated] = useState({});
  const [companyCode, setCompanyCode] = useState(null);

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  const {
    companystates,
    loadingCompanyStates,
    counties,
    loadingCounties,
    propertyTypes,
    numberOfUnits,
    listingStatuses,
    loadingListingStatuses,
    companyList,
    loadingCompanyList,
    userList,
    loadingUserList,
    licenseStatesPerUserList,
    loadinglicenseStatesPerUser,
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      companystates: state.licenseStates.statesPerCompany.data,
      loadingCompanyStates: state.licenseStates.statesPerCompany.loading,
      counties: state.counties.countiesPerState.data,
      loadingCounties: state.counties.countiesPerState.loading,
      propertyTypes: state.propertyType.items,
      numberOfUnits: state.numberOfUnits.data,
      listingStatuses: state.listingStatus.statuses.data,
      loadingListingStatuses: state.listingStatus.statuses.loading,
      companyList: state.company.companyList.company,
      loadingCompanyList: state.company.companyList.loading,
      userList: state.users.usersPerCompany.list,
      loadingUserList: state.users.usersPerCompany.loading,
      licenseStatesPerUserList: state.licenses.licenseStatesPerUser.data,
      loadinglicenseStatesPerUser: state.licenses.licenseStatesPerUser.loading,
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  const { updateListing } = useSelector(
    (state) => state.listings,
    shallowEqual
  );

  const isEditMode = updateListing.isEdit;
  const isListingLoading = updateListing.loading;
  const isUplistAdmin = userData?.user_type_id === 1;
  const defaultLOFields = [
    "property_state",
    "property_county",
    "property_zip",
    "loan_officer",
    "license_state",
    "user_license_id",
    "email",
    "mobile_number",
    "page_link",
    "user_license_state",
  ];

  const setFieldsForListingUser = (user) => {
    const id = updateListing.listing.id ?? "";
    const mls = form.getFieldValue("mls_number") ?? "";
    const code = companyCode ?? user.company.code;

    const formatted = {
      loan_officer: `${user.first_name} ${user.last_name}`,
      email: user.email,
      mobile_number: user.mobile_number,
      page_link: `${config.appUrl}/${code}${baseRoute}/${user.url_identifier}-mls${mls}/${id}`,
    };

    for (const key in formatted) {
      form.setFields([
        {
          name: key,
          value: formatted[key],
        },
      ]);
    }
  };

  useEffect(() => {
    if (!isEditMode && numberOfUnits.length) {
      form.setFields([
        { name: "units_count", value: { value: "OneUnit", label: "One Unit" } },
      ]);
    }
  }, [updateListing, numberOfUnits]);

  useEffect(() => {
    if (!isListingLoading && isEditMode) {
      setTimeout(() => {
        setHideForm(false);
      }, [2000]);
    }
  }, [isListingLoading]);

  // CREATE
  useEffect(() => {
    if (!isEditMode && userData && Object.keys(userData).length) {
      // for loan officer
      if (!isUplistAdmin) {
        setSelectedUser({
          id: userData.id,
          url_identifier: userData.url_identifier,
        });
        setFieldsForListingUser(userData);
      }
    }

    setCompanyCode(updateListing.listing.company_code ?? userData.company.code);
  }, [userData, updateListing, listingStatuses]);

  useEffect(() => {
    if (listingStatuses.length) {
      if (isEditMode) {
        setFilteredStatuses(listingStatuses);
      } else {
        const filtered = listingStatuses.filter(
          (status) => status.value !== "archived"
        );
        setFilteredStatuses(filtered);
      }
    }
  }, [listingStatuses]);

  // UPDATE
  useEffect(() => {
    if (
      isEditMode &&
      !isListingLoading &&
      Object.keys(updateListing.listing).length
    ) {
      setFilteredStatuses(listingStatuses);
      const {
        state_id,
        full_state,
        county_id,
        county,
        property_type,
        property_type_desc,
        units_count,
        units_count_desc,
        user_id,
        company_id,
        // usda_lookup,
        fha_condo_lookup,
        va_condo_lookup,
        url_identifier,
        credit_verified_by,
        listing_status,
        listing_status_desc,
        company_code,
      } = updateListing.listing;

      const formatted = {
        ...updateListing.listing,
        property_state: { value: state_id, label: full_state },
        property_type: { value: property_type, label: property_type_desc },
        units_count: { value: units_count, label: units_count_desc },
        property_county: { value: county_id, label: county },
        listing_status: { value: listing_status, label: listing_status_desc },
        credit_verified_by: {
          value: credit_verified_by,
          label: credit_verified_by,
        },
        license_state: full_state,
        // usda_lookup: Boolean(usda_lookup),
        fha_condo_lookup: Boolean(fha_condo_lookup),
        va_condo_lookup: Boolean(va_condo_lookup),
      };

      setCompanyCode(company_code);
      setSelectedStatus(listing_status);

      if (publishable.includes(listing_status)) {
        setIsEligible(true);
      }

      // get Licenses per user
      dispatch(getLicenseStatesPerUserAction(user_id));

      // set selected user for handling US state change
      setSelectedUser({ id: user_id, url_identifier });

      if (isUplistAdmin) {
        dispatch(getUsersPerCompanyAction(company_id));
      }

      if (condoTypes.includes(property_type)) {
        setShowLookup(true);
      }

      // get states per company
      dispatch(getStatesPerCompanyAction(company_id));

      // get Counties per state
      dispatch(getCountiesPerStateAction(state_id));

      for (const key in formatted) {
        form.setFields([
          {
            name: `${key}`,
            value: formatted[key],
          },
        ]);
      }

      if (isUplistAdmin) {
        const toEditCompany = companyList.filter(
          (company) => company.value === company_id
        );

        form.setFields([
          {
            name: "company_id",
            value: toEditCompany[0],
          },
        ]);
      }
    }
  }, [isListingLoading, updateListing, companyList]);

  useEffect(() => {
    if (isUplistAdmin && isEditMode && !updateListing.loading) {
      if (Object.keys(updateListing.listing).length && userList.length) {
        const toEditUser = userList.filter(
          (user) => user.value === updateListing.listing.user_id
        );

        form.setFields([{ name: "user_id", value: toEditUser[0] }]);
      }
    }
  }, [userList, updateListing]);

  // update mode for user state license
  useEffect(() => {
    if (isEditMode && !isListingLoading && !loadinglicenseStatesPerUser) {
      if (
        Object.keys(updateListing.listing).length &&
        licenseStatesPerUserList.length
      ) {
        const filtered = licenseStatesPerUserList.filter(
          (license) => license.key === updateListing.listing.user_license_id
        );
        form.setFields([
          { name: "user_license_id", value: filtered[0]?.license },
          {
            name: "user_license_state",
            value: { value: filtered[0]?.value, label: filtered[0]?.value },
          },
          { name: "license_state", value: filtered[0]?.value },
        ]);
      }
    }
  }, [updateListing, isListingLoading, licenseStatesPerUserList]);

  const checkIsUpdate = () => {
    const { pathname } = new URL(window.location.href);
    const action = pathname.split("/").pop();
    if (action === "add") {
      return false;
    } else {
      if (isEditMode) {
        return hideForm;
      } else {
        return false;
      }
    }
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

  const noLicenseSnackbar = () => {
    snackBar(
      "No license added for the selected State",
      "Please add a license in My State Licenses page.",
      "error"
    );
  };

  const eligibleCheckSnackbar = () => {
    snackBar(
      "",
      "Please verify that the property is eligible for financing.",
      "error"
    );
  };

  const dispatchListingProgress = (val) => {
    dispatch({
      type: LISTINGS.onProgress,
      payload: val,
    });
  };

  const convertFloat = (val, isPercent) =>
    parseToDecimal(val, isPercent ? 1 : 3);

  const checkNaNVal = (val, isPercent = false) => {
    return !val || isNaN(val) ? 0 : convertFloat(val, isPercent);
  };

  const formatSubmitData = async (values) => {
    const selectedState = companystates.filter(
      (state) => state.value === values.property_state.label
    );

    const selectedCounty = counties.filter(
      (state) => state.value === values.property_county.label
    );

    const selectedLicense = licenseStatesPerUserList.filter(
      (state) => state.value === values.user_license_state.label
    );

    return {
      ...values,
      state_id: selectedState[0].key,
      county_id: selectedCounty[0].key,
      user_license_id: selectedLicense[0].key,
      property_type: values.property_type.value,
      property_value: checkNaNVal(values.property_value),
      seller_credits: checkNaNVal(values.seller_credits),
      default_down_payment: checkNaNVal(values.default_down_payment, true),
      loan_amount: checkNaNVal(values.loan_amount),
      hoa_dues: checkNaNVal(values.hoa_dues),
      property_taxes: checkNaNVal(values.property_taxes),
      homeowners_insurance: checkNaNVal(values.homeowners_insurance),
      units_count: values.units_count.value,
      listing_status: values.listing_status.value,
      credit_verified_by: values.credit_verified_by.value,
      usda_lookup: false,
      fha_condo_lookup: values.fha_condo_lookup ?? true,
      va_condo_lookup: values.va_condo_lookup ?? true,
    };
  };

  const onPropagation = (change, open, isURL) => {
    dispatch(formDialogAlert(change, open, isURL));
  };

  const handleSuccess = (response, controller) => {
    onPropagation(false, false, "");
    formChangeRemove();
    snackBar(response.data.message, "", "success");
    const listingId = isEditMode
      ? updateListing.listing.id
      : response.data.listing_id;

    const redirect =
      selectedStatus === "archived"
        ? "/listings"
        : `/listings/view/${listingId}`;

    setTimeout(() => {
      window.location.href = redirect;
    }, 800);

    dispatchListingProgress(false);

    setTimeout(() => {
      form.resetFields();
      controller.abort();
    }, 900);
  };

  const handleFinish = async (values) => {
    if (!values.user_license_id) {
      noLicenseSnackbar();
      return;
    }

    if (publishable.includes(selectedStatus) && !isEligible) {
      eligibleCheckSnackbar();
      return;
    }

    dispatch(setSpinningAction(true));
    setIsLoading(true);

    const controller = new AbortController();
    const { signal } = controller;

    const userId = isUplistAdmin ? values.user_id.value : userData.id;
    const companyId = isUplistAdmin
      ? values.company_id.value
      : userData.company_id;
    const urlIdentifier = isUplistAdmin
      ? selectedUser.url_identifier
      : userData.url_identifier;

    const formattedSubmitData = await formatSubmitData(values);

    try {
      const formatted = {
        ...values,
        ...formattedSubmitData,
        page_link: `${baseRoute}/${urlIdentifier}-mls${values.mls_number}`,
        user_id: userId,
        company_id: companyId,
      };

      const response = await dispatch(createListingAction(formatted, signal));
      if (response.status === 200) {
        handleSuccess(response, controller);
      }
    } catch (error) {
      onPropagation(false, false, "");
      formChangeRemove();
      onHandleError(error, dispatch);
      setIsLoading(false);
    } finally {
      dispatch(setSpinningAction(false));
    }
  };

  const handleUpdateFinish = async () => {
    const values = tempUpdated;

    if (!values.user_license_id) {
      noLicenseSnackbar();
      return;
    }

    dispatch(setSpinningAction(true));
    setIsLoading(true);
    showEditModal(false);

    const controller = new AbortController();
    const { signal } = controller;

    try {
      const { id, user_id, company_id, url_identifier } = updateListing.listing;

      const userId = isUplistAdmin ? values.user_id.id : user_id;
      const companyId = isUplistAdmin ? values.company_id.value : company_id;
      const urlIdentifier = isUplistAdmin
        ? selectedUser.url_identifier
        : url_identifier;

      const formattedSubmitData = await formatSubmitData(values);

      const formatted = {
        ...formattedSubmitData,
        user_id: userId,
        company_id: companyId,
        page_link: `${baseRoute}/${urlIdentifier}-mls${values.mls_number}`,
      };

      const response = await dispatch(
        updateListingAction(id, formatted, signal)
      );

      if (response.status === 200) {
        handleSuccess(response, controller);
      }
    } catch (error) {
      onHandleError(error, dispatch);
      setIsLoading(false);
    } finally {
      dispatch(setSpinningAction(false));
    }
  };

  const handleConfirmUpdate = (values) => {
    if (publishable.includes(selectedStatus) && !isEligible) {
      eligibleCheckSnackbar();
      return;
    }

    setTempUpdated(values);
    showEditModal(true);
  };

  const handleMLSChange = (val) => {
    const id = updateListing.listing.id ?? "";
    const identifier = selectedUser.url_identifier ?? "";
    const mls = val || "";
    const formatted = `${config.appUrl}/${companyCode}${baseRoute}/${identifier}-mls${mls}/${id}`;
    form.setFields([{ name: "page_link", value: formatted }]);
  };

  const clearStateAndCountyOptions = () => {
    resetUserLicenseStateAction(dispatch);
    resetCountyAction(dispatch);
  };

  const handleCompanyChange = (val) => {
    clearStateAndCountyOptions();
    resetStateAction(dispatch);
    setCompanyCode(null);
    dispatch({
      type: USERS.usersPerCompany,
      payload: {
        list: [],
        loading: false,
      },
    });
    setSelectedUser({});
    form.resetFields([...defaultLOFields, "user_id"]);

    if (val) {
      // get states per company
      dispatch(getStatesPerCompanyAction(val));
      dispatch(getUsersPerCompanyAction(val));

      const company = find(companyList, { value: val });
      setCompanyCode(company.code);
    }
  };

  const handleSelectUser = (val) => {
    if (!val) {
      clearStateAndCountyOptions();
      form.resetFields(defaultLOFields);
      return;
    }

    const filtered = userList.filter((user) => user.id === val);
    form.resetFields(defaultLOFields);

    if (filtered.length) {
      const user = filtered[0];

      // get licenses per user
      dispatch(getLicenseStatesPerUserAction(val));

      setSelectedUser({ id: user.id, url_identifier: user.url_identifier });
      handleMLSChange(form.getFieldValue("mls_number") ?? "");
      setFieldsForListingUser(user);
    }
  };

  const handleStateChange = (value) => {
    if (!Object.keys(selectedUser).length) {
      snackBar(
        "No selected Loan Officer",
        "Please select a loan officer above.",
        "error"
      );
      return;
    }

    const filtered = companystates.filter((state) => state.value === value);
    if (!filtered.length) {
      form.resetFields(["property_county", "property_zip"]);
      resetCountyAction(dispatch);
      return;
    }

    // get Counties per state
    dispatch(getCountiesPerStateAction(filtered[0].key));

    form.resetFields(["property_county", "property_zip"]);
  };

  const handleCountyChange = () => {
    form.resetFields(["property_zip"]);
  };

  const handleSelectUserLicenseState = (val) => {
    const filtered = licenseStatesPerUserList.filter(
      (license) => license.value === val
    );

    if (!filtered.length) {
      form.resetFields(["license_state", "user_license_id"]);
      return;
    }

    form.setFields([
      { name: "license_state", value: filtered[0].value },
      { name: "user_license_id", value: filtered[0].license },
    ]);
  };

  const handleReturnAction = () => {
    if (toLicenses) {
      return (window.location.href = "/my-state-licenses");
    }

    if (url) {
      return (window.location.href = url);
    }

    window.history.back();
  };

  const checkBackAction = () => {
    if (isChange || isLoading) {
      return onPropagation(true, true, "");
    }

    handleReturnAction();
  };

  const handleSelectPropertyType = (type) => {
    const isPropertyCondo = condoTypes.includes(type);

    setShowLookup(isPropertyCondo);

    form.setFields([
      { name: "va_condo_lookup", value: !isPropertyCondo },
      { name: "fha_condo_lookup", value: !isPropertyCondo },
    ]);
  };

  const handleCalculations = (formName) => {
    const { getFieldValue, setFieldValue, resetFields } = form;
    const propertyValue = getFieldValue("property_value") ?? 0;
    let downPaymentPercentage = getFieldValue("default_down_payment") ?? 0;
    let loanAmount = getFieldValue("loan_amount") ?? 0;

    if (loanAmount > propertyValue) {
      const val = parseToDecimal(propertyValue, 0);
      loanAmount = val;
      setFieldValue("loan_amount", val);
    }

    if (formName === "default_down_payment" || formName === "property_value") {
      resetFields(["loan_amount"]);

      downPaymentPercentage = Number.isInteger(downPaymentPercentage)
        ? downPaymentPercentage
        : parseToDecimal(downPaymentPercentage, 1);

      if (downPaymentPercentage > 100) {
        downPaymentPercentage = 100;
      }

      const calculatedDownPayment =
        (downPaymentPercentage * propertyValue) / 100;
      const calculatedLoanAmount = propertyValue - calculatedDownPayment;

      setFieldValue("default_down_payment", downPaymentPercentage);
      setFieldValue("loan_amount", parseToDecimal(calculatedLoanAmount, 0));
    }

    if (formName === "loan_amount") {
      resetFields(["default_down_payment"]);
      let percentage = ((propertyValue - loanAmount) / propertyValue) * 100;
      percentage = isNaN(percentage) ? 0 : percentage;
      percentage = Number.isInteger(percentage)
        ? percentage
        : parseToDecimal(percentage, 1);

      setFieldValue("default_down_payment", percentage);
    }
  };

  return (
    <div>
      <BackButton handleBack={checkBackAction} />
      <div className="mx-auto w-full mt-10">
        <div className="flex justify-start items-start mb-3">
          <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
            {isEditMode ? "Update" : "Create"} a Listing
          </h2>
        </div>
        <CustomDivider />
        <div className="mt-7">
          <Form
            layout="vertical"
            form={form}
            onFinish={isEditMode ? handleConfirmUpdate : handleFinish}
            scrollToFirstError={{ behavior: "smooth" }}
            onFinishFailed={() =>
              snackBar("Some fields requires your attention.", "", "error")
            }
            onFieldsChange={(changedValue, _) => {
              for (const value of changedValue) {
                if (value.touched) {
                  /**
                   * Once only to dispatch the form change
                   * add or update
                   */
                  if (!isChange) {
                    onPropagation(true, false, "");
                  } else {
                    if (getChangeForm() === null) {
                      onPropagation(true, false, "");
                    }
                  }
                  break;
                }
              }
            }}
          >
            {isUplistAdmin && (
              <div>
                <SectionFormContainer label={"Loan Officer Details"}>
                  <Col className="flex md:gap-4 w-full flex-col md:flex-row">
                    <div className="flex-1 w-full">
                      <CustomFormItem
                        label="Company"
                        name="company_id"
                        required
                        rules={config.requiredRule.slice(0, 1)}
                      >
                        {checkIsUpdate() ? (
                          <Skeleton.Input active size="default" />
                        ) : (
                          <CustomSelect
                            placeholder="Select Company"
                            options={companyList}
                            disabled={loadingCompanyList}
                            onChange={(opt) => handleCompanyChange(opt?.value)}
                            withsearch="true"
                          />
                        )}
                      </CustomFormItem>
                    </div>
                    <div className="flex-1 w-full">
                      <CustomFormItem
                        label="Loan Officer"
                        name="user_id"
                        required
                        rules={config.requiredRule.slice(0, 1)}
                      >
                        {checkIsUpdate() ? (
                          <Skeleton.Input active size="default" />
                        ) : (
                          <CustomSelect
                            placeholder="Select Loan Officer"
                            options={userList}
                            disabled={loadingUserList}
                            onChange={(opt) => handleSelectUser(opt?.value)}
                            withsearch="true"
                          />
                        )}
                      </CustomFormItem>
                    </div>
                  </Col>
                </SectionFormContainer>
              </div>
            )}

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
                          onChange={(opt) =>
                            handleSelectUserLicenseState(opt?.value)
                          }
                          withsearch="true"
                          statesearch="true"
                        />
                      )}
                    </CustomFormItem>
                    <span className="font-sharp-sans text-xxs">
                      Check{" "}
                      <Link
                        href="/my-state-licenses"
                        className="text-xanth font-sharp-sans-bold"
                        onClick={(e) => {
                          e.preventDefault();
                          if (form.isFieldsTouched()) {
                            setToLicenses(true);
                            return onPropagation(true, true, "");
                          }
                          window.location.href = "/my-state-licenses";
                        }}
                      >
                        My State Licenses
                      </Link>{" "}
                      page to add state license.
                    </span>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="License Number"
                      name="user_license_id"
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
            <div>
              <SectionFormContainer label={"MLS Details"}>
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
                          onChange={(e) => handleMLSChange(e.target.value)}
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

                <Col className="flex justify-start items-center w-full">
                  <div className="flex-1 mb-4">
                    <CustomFormItem
                      label="System Generated Page Link"
                      name="page_link"
                      mb="0"
                      footnote="Flyer QR Code will point users to this URL for rates"
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" disabled={true} />
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
                      footnote="Not shown to website users"
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
                      footnote="Not shown to website users"
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

              <SectionFormContainer label={"Property Info"}>
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
                </Col>

                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
                  <div className="w-full lg:w-2/5">
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
                  <div className="w-full lg:w-1/5">
                    <CustomFormItem
                      label="State"
                      name="property_state"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select State"
                          options={companystates}
                          disabled={loadingCompanyStates}
                          onChange={(opt) => handleStateChange(opt?.value)}
                          withsearch="true"
                          statesearch="true"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="w-full lg:w-1/5">
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
                  <div className="w-full lg:w-1/5">
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
              </SectionFormContainer>

              <SectionFormContainer label={"Mortgage and Payment Details"}>
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
                          onChange={() => handleCalculations("property_value")}
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
                      required
                      rules={config.requiredRule.slice(0, 1)}
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
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select a Name"
                          options={verifiedByOptions}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>

                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Default Down Payment(%)"
                      name="default_down_payment"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                      initialValue={20}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          suffix={"%"}
                          placeholder="Enter Default Down Payment"
                          onChange={() =>
                            handleCalculations("default_down_payment")
                          }
                          precision={1}
                          step={0.1}
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Amount($)"
                      name="loan_amount"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          type="currency"
                          placeholder="Enter Loan Amount"
                          onChange={() => handleCalculations("loan_amount")}
                          precision={0}
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
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
                </Col>

                <Col className="flex justify-center flex-col md:flex-row items-center md:gap-4 w-full">
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
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Homeowners Insurance ($/month)"
                      name="homeowners_insurance"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInputNumber
                          type="currency"
                          placeholder="Enter Homeowners Insurance"
                          min={0}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full"></div>
                </Col>
              </SectionFormContainer>

              <SectionFormContainer label={"Publisher"}>
                <Col className="flex justify-center flex-col md:flex-row md:gap-4 w-full mb-4">
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
                      label="Licensing State"
                      name="license_state"
                      mb="0"
                      disabled
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" disabled />
                      )}
                    </CustomFormItem>
                    <span className="font-sharp-sans text-xxs">
                      Check{" "}
                      <Link
                        href="/my-state-licenses"
                        className="text-xanth font-sharp-sans-bold"
                        onClick={(e) => {
                          e.preventDefault();
                          if (form.isFieldsTouched()) {
                            setToLicenses(true);
                            return onPropagation(true, true, "");
                          }
                          window.location.href = "/my-state-licenses";
                        }}
                      >
                        My State Licenses
                      </Link>{" "}
                      page to add state license.
                    </span>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="License Number"
                      name="user_license_id"
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

                <Col className="flex justify-center flex-col md:flex-row md:gap-4 w-full">
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
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Listing Status"
                      name="listing_status"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                      additionalInfo={<ListingStatusDescriptions />}
                      isfootnotecomponent
                      footnote={
                        publishable.includes(selectedStatus) && (
                          <Col className="flex justify-center items-center gap-4 w-full">
                            <div className="flex-1">
                              <div className="mt-2 mb-[10px]">
                                <Checkbox
                                  checked={isEligible}
                                  onChange={(e) =>
                                    setIsEligible(e.target.checked)
                                  }
                                  className="font-sharp-sans-medium text-neutral-2"
                                >
                                  I have verified this property is eligible for
                                  financing
                                </Checkbox>
                              </div>
                            </div>
                          </Col>
                        )
                      }
                    >
                      {checkIsUpdate() ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select Status"
                          options={filteredStatuses}
                          disabled={loadingListingStatuses}
                          onChange={(val) => {
                            setSelectedStatus(val?.value);
                            setIsLoading(false);
                            setIsEligible(false);
                          }}
                          className={selectedStatus ? 'has-listing-status' : 'no-listing-status'}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </Col>
              </SectionFormContainer>
            </div>

            <div className="w-full flex flex-col md:flex-row-reverse mt-6 pb-16 gap-3">
              <div>
                <CustomButton
                  htmlType="submit"
                  label={`${isEditMode ? "Update" : "Create"} Listing`}
                  isfullwidth={true}
                  disabled={isListingLoading || isLoading}
                  isloading={isLoading.toString()}
                />
              </div>
              <div>
                <CustomHollowButton
                  onClick={checkBackAction}
                  label="Cancel"
                  isfullwidth
                />
              </div>
            </div>
          </Form>
        </div>
      </div>
      <ListingConfirmUpdateComponent
        open={editModal}
        onCancel={() => {
          setTempUpdated({});
          showEditModal(false);
        }}
        onSubmit={handleUpdateFinish}
        disabled={
          isLoading ||
          loadingCounties ||
          loadinglicenseStatesPerUser ||
          loadingCompanyStates
        }
        isLoading={isLoading}
        selectedStatus={selectedStatus}
        source="add"
      />
      <ConfirmProgressModal
        isShowModal={isModalOpen}
        isLoading={isLoading}
        handleBack={() => {
          formChangeRemove();
          onPropagation(false, false, "");
          handleReturnAction();
        }}
        handleCancel={() => {
          onPropagation(true, false, "");
          setToLicenses(false);
        }}
      />
    </div>
  );
};

export default AddListing;
