import React, { useEffect, useState } from "react";
import { Checkbox, Form } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import {
  createUserLicenseAction,
  getLicenseListAction,
  getLicensesByUser,
  isEditLicenseAction,
  selectedLicenseAction,
  updateLicenseAction,
} from "~/store/licenses/action";
import { LICENSES } from "~/store/licenses/type";
import {
  backForwardToPage,
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  setSpinningAction,
} from "~/store/ui/action";
import { defaultPagination } from "~/utils/constants";

import CustomDivider from "../base/CustomDivider";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomButton from "../base/CustomButton";
import CustomSelect from "../base/CustomSelect";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import BackButton from "../base/buttons/BackButton";
import { completeOnboardingAction } from "~/store/users/action";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import { getStatesPerCompanyAction } from "~/store/state/action";
import LicenseList from "./LicenseListComponent";

const AddLicenseComponent = (props) => {
  const isOnboarding = 'onboarding' in props
  const showBackButton = props.showBackButton ?? true
  const showCancelButton = props.showCancelButton ?? true
  const showContentHeader = props.showContentHeader ?? true
  const alignActionButtonCenter = props.alignActionButtonCenter ?? false
  const user = props.user ?? null

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [useNmlsId, setUseNmlsId] = useState(false);
  const [formattedList, setFormattedList] = useState([]);

  const [confirmButton, setConfirmButton] = useState("");
  const [loanOfficerOnboardingLoading, setLoanOfficerOnboardingLoading] =
    useState(false);

  const [form] = Form.useForm();

  const {
    authUser,
    licenses,
    loadingLicense,
    companystates,
    loadingCompanyStates,
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      authUser: state.auth.data.user,
      licenses: state.licenses.listOfLicenses.list,
      loadingLicense: state.licenses.listOfLicenses.loading,
      companystates: state.licenseStates.statesPerCompany.data,
      loadingCompanyStates: state.licenseStates.statesPerCompany.loading,
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  useEffect(() => {
    if (Object.keys(licenses).length && companystates.length) {
      const filteredStates = companystates.filter(
        (state) =>
          !licenses.data.map((license) => license.state_id).includes(state.key)
      );

      setFormattedList(filteredStates);
    }
  }, [licenses, companystates]);

  const { updateLicense } = useSelector(
    (state) => state.licenses,
    shallowEqual
  );

  useEffect(() => {
    if (updateLicense.isEdit && !updateLicense.loading) {
      if (Object.keys(updateLicense.license).length) {
        for (const key in updateLicense.license) {
          // change state id to state name for mapping fields
          if (key === "state_id") {
            updateLicense.license[key] = {
              value: updateLicense.license["id"],
              label: updateLicense.license["state"],
            };
          }
          form.setFields([
            {
              name: `${key}`,
              value: updateLicense.license[key],
            },
          ]);
        }
      }
    }
  }, [updateLicense]);

  useEffect(() => {
    if (isOnboarding) {
      const onboarding = localStorage.getItem("onboarding");
      if (onboarding) {
        const onboardingUser = JSON.parse(onboarding);
        const userIndex = onboardingUser.findIndex(
          (item) => item.id === props.onboarding.id
        );
        if (userIndex !== -1) {
          if (onboardingUser[userIndex].hasOwnProperty("next")) {
            if (typeof onboardingUser[userIndex].next !== "string") {
              throw new Error("next must be a string");
            }
            setConfirmButton(onboardingUser[userIndex].next);
          } else {
            onboardingUser[userIndex].next = "";
            setConfirmButton("");
          }
        }

        localStorage.setItem("onboarding", JSON.stringify(onboardingUser));
      }
    }
  }, [props]);

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

  const onPropagation = (change, open, isURL) => {
    dispatch(formDialogAlert(change, open, isURL));
  };

  const handleSuccess = (response, controller) => {
    if (isOnboarding) {
      /**
       * Call the api again to get the updated list of licenses
       */
      dispatch(getStatesPerCompanyAction(props.onboarding.company.id));
      dispatch(
        getLicenseListAction({
          page: 1,
          limit: defaultPagination.pageSize,
          search: "",
          stateId: "",
          sortBy: "updated_at",
          order: "desc",
        })
      );
      snackBar(response.data.message, "", "success");
      setIsLoading(false);
      form.resetFields();
      setUseNmlsId(false);
      const onboarding = localStorage.getItem("onboarding");
      if (onboarding) {
        const onboardingUser = JSON.parse(onboarding);
        const userIndex = onboardingUser.findIndex(
          (item) => item.id === props.onboarding.id
        );
        if (userIndex !== -1) {
          if (onboardingUser[userIndex].hasOwnProperty("next")) {
            if (typeof onboardingUser[userIndex].next !== "string") {
              throw new Error("next must be a string");
            }
            onboardingUser[userIndex].next = "proceed";
            setConfirmButton(onboardingUser[userIndex].next);
          } else {
            onboardingUser[userIndex].next = "proceed";
            setConfirmButton("proceed");
          }
          localStorage.setItem("onboarding", JSON.stringify(onboardingUser));
        }
      }
    } else {
      onPropagation(false, false, "");
      formChangeRemove();
      snackBar(response.data.message, "", "success");

      !user ? setTimeout(() => {
        window.location.href = '/my-state-licenses'
      }, 800) : setIsLoading(false)

      setTimeout(() => {
        form.resetFields();
        setUseNmlsId(false);
        controller.abort();

        if (user) {
          getLicensesByUser(
            user.id,
            1,
            defaultPagination.pageSize,
            '',
            '',
            'updated_at',
            'desc',
          )
        }
      }, 900);

      setTimeout(() => {
        dispatch(setSpinningAction(false));
      }, 1000);
    }
  };

  const handleError = (error) => {
    setTimeout(() => {
      dispatch(setSpinningAction(false));
    }, 1000);
    onHandleError(error, dispatch);
    setIsLoading(false);
  };

  const getFiltered = (values) => {
    return companystates.filter(
      (state) => state.value === values.state_id.label
    );
  };

  const handleFinish = async (values) => {
    const controller = new AbortController();
    const { signal } = controller;

    if (!isOnboarding && !user) {
      dispatch(setSpinningAction(true))
    }

    try {
      setIsLoading(true);
      const selectedState = getFiltered(values);

      const response = await dispatch(
        createUserLicenseAction({
          ...values,
          state_id: selectedState[0].key,
          user_id: user?.id ?? authUser.id,
        }, signal)
      );

      if (response.status === 200) {
        handleSuccess(response, controller);
      }
    } catch (error) {
      onPropagation(false, false, "");
      formChangeRemove();
      handleError(error);
    }
  };

  const handleUpdateFinish = async (values) => {
    const controller = new AbortController();
    const { signal } = controller;
    dispatch(setSpinningAction(true));

    try {
      setIsLoading(true);
      const selectedState = getFiltered(values);

      const response = await dispatch(
        updateLicenseAction(updateLicense.license.id, {
          ...values,
          state_id: selectedState[0].key,
          user_id: authUser.id,
        }, signal)
      )

      if (response.status === 200) {
        handleSuccess(response, controller);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleReturnAction = () => {
    // clear state if from from edit mode
    if (updateLicense.isEdit) {
      dispatch(isEditLicenseAction(false));
      dispatch(selectedLicenseAction({}));
    }

    form.resetFields();

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

  const handleChangeLicenseValue = (e) => {
    const checked = e.target.checked;

    if (checked) {
      form.setFields([
        {
          name: "license",
          errors: [],
        },
      ]);
    }
    setUseNmlsId(checked);
    const nmls = user?.nmls_num ?? authUser?.nmls_num
    return form.setFieldValue(
      "license",
      checked ? nmls ?? '' : ''
    );
  };

  return (
    <div className={user ? "pb-6" : "pb-16"}>
      {(!isOnboarding && showBackButton) && (
        <>
          <BackButton handleBack={checkBackAction} />
        </>
      )}

      <div className={`mx-auto w-full ${showContentHeader ? 'mt-10' : 'mt-0'}`}>
        {(!isOnboarding && showContentHeader) && (
          <>
            <div className="flex justify-start items-start mb-3">
              <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
                {updateLicense.isEdit ? "Update" : "Add"} a License
              </h2>
            </div>
            <CustomDivider />
          </>
        )}

        <div className="mt-7">
          <Form
            layout="vertical"
            form={form}
            className="mt-5"
            onFinish={updateLicense.isEdit ? handleUpdateFinish : handleFinish}
            onFieldsChange={(changedValue, _) => {
              for (const value of changedValue) {
                if (value.touched) {
                  if (!props.hasOwnProperty("onboarding")) {
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
                  }
                  break;
                }
              }
            }}
          >
            <div className="mb-6">
              <Checkbox
                checked={useNmlsId}
                onChange={handleChangeLicenseValue}
                className="font-sharp-sans-medium text-neutral-3"
              >
                <div className="text-neutral-2 font-sharp-sans-semibold text-body-4">
                  Use NMLS ID for the selected state
                </div>
              </Checkbox>
            </div>

            <div className="flex flex-col md:flex-row md:gap-5">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="State"
                  name="state_id"
                  required
                  rules={
                    isOnboarding
                      ? formattedList.length > 0
                        ? config.requiredRule.slice(0, 1)
                        : [
                            {
                              required: false,
                            },
                          ]
                      : config.requiredRule.slice(0, 1)
                  }
                >
                  <CustomSelect
                    placeholder="Select a State"
                    options={formattedList}
                    disabled={loadingCompanyStates && loadingLicense}
                    withsearch="true"
                    statesearch="true"
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="License"
                  name="license"
                  required
                  rules={
                    isOnboarding
                      ? formattedList.length > 0
                        ? config.requiredRule
                        : [
                            {
                              required: false,
                            },
                          ]
                      : config.requiredRule
                  }
                  // rules={config.requiredRule}
                >
                  <CustomInput
                    type="text"
                    placeholder="Enter a License"
                    onChange={() => setUseNmlsId(false)}
                  />
                </CustomFormItem>
              </div>
            </div>

            {isOnboarding && (
              <div className="w-full flex flex-col md:flex-row-reverse justify-center">
                <div>
                  <CustomButton
                    htmlType="submit"
                    label={`Add License`}
                    isfullwidth={true}
                    disabled={isLoading || formattedList.length === 0}
                    isloading={isLoading.toString()}
                  />
                </div>
              </div>
            )}

            <div
              className={`w-full flex flex-col md:flex-row-reverse ${
                (isOnboarding || alignActionButtonCenter) && "justify-center mb-5"
              } mt-4 gap-3`}
            >
              <div>
                {isOnboarding ? (
                  <CustomButton
                    label={`${
                      Number(props.onboarding.user_type_id) === 3
                        ? "Confirm"
                        : "Next"
                    }`}
                    isfullwidth={true}
                    disabled={
                      confirmButton === "proceed"
                        ? false
                        : formattedList.length === 0
                        ? false
                        : true
                    }
                    onClick={() => {
                      if (confirmButton === "proceed") {
                        if (Number(props.onboarding.user_type_id) === 2) {
                          dispatch(backForwardToPage(4, props));
                        } else {
                          if (Number(props.onboarding.user_type_id) === 3) {
                            dispatch(completeOnboardingAction(false));
                            setLoanOfficerOnboardingLoading(true);
                          }
                        }
                      }
                    }}
                    isloading={loanOfficerOnboardingLoading.toString()}
                  />
                ) : (
                  <CustomButton
                    htmlType="submit"
                    label={`${
                      updateLicense.isEdit ? "Update License" : "Add License"
                    }`}
                    isfullwidth={true}
                    disabled={isLoading}
                    isloading={isLoading.toString()}
                  />
                )}
              </div>
              {showCancelButton &&
                <div>
                  <CustomHollowButton
                    isfullwidth={isOnboarding ? false : true}
                    onClick={() => {
                      if (isOnboarding) {
                        if (Number(props.onboarding.user_type_id) === 3) {
                          dispatch(backForwardToPage(1, props));
                        } else {
                          dispatch(backForwardToPage(2, props));
                        }
                      } else {
                        checkBackAction();
                      }
                    }}
                    label={isOnboarding ? "Back" : "Cancel"}
                  />
                </div>
              }
            </div>
            {isOnboarding && (
              <>
                {Number(props.onboarding.user_type_id) === 2 && (
                  <div className="text-center my-3 text-neutral-3 font-sharp-sans-bold ">
                    <span
                      role="button"
                      className="cursor-pointer"
                      onClick={() => dispatch(backForwardToPage(4, props))}
                    >
                      Skip
                    </span>
                  </div>
                )}
                {Number(props.onboarding.user_type_id) === 3  && (
                  <div className="text-center my-3 text-neutral-3 font-sharp-sans-bold ">
                    <span
                      role="button"
                      className="cursor-pointer"
                      onClick={() => dispatch(completeOnboardingAction(true))}
                    >
                      Skip
                    </span>
                  </div>
                )}

                <div className="text-center mb-2 w-full text-neutral-3 font-sharp-sans">
                  {Number(props.onboarding.user_type_id) === 3
                    ? "2 of 2"
                    : "3 of 4"}
                </div>
              </>
            )}
          </Form>
          {isOnboarding && <LicenseList {...props} />}
        </div>
      </div>
      <ConfirmProgressModal
        isShowModal={isModalOpen}
        isLoading={isLoading}
        handleBack={() => {
          formChangeRemove();
          onPropagation(false, false, "");
          handleReturnAction();
        }}
        handleCancel={() => onPropagation(true, false, "")}
      />
    </div>
  );
};

export default AddLicenseComponent;
