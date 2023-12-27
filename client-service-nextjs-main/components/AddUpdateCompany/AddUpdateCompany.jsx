import React, { useEffect, useRef, useState, useMemo } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import CustomDivider from "../base/CustomDivider";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import {
  Button,
  Form,
  Input as InputAntd,
  Checkbox,
  ColorPicker,
  Progress,
  Skeleton,
  Radio,
} from "antd";
import { autoCrop } from "~/plugins/autoCropt";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import config from "~/config";
import { STATES } from "~/store/state/type";
import {
  createCompanyAction,
  getCompanyAction,
  updateCompanyAction,
} from "~/store/company/action";
import { checkUniqueCompanyCompanyNMLSUmberAPI } from "~/store/company/api";
import { onHandleError } from "~/error/onHandleError";
import { trimTheState } from "~/plugins/trimState";
import { validateMobileNumber } from "~/plugins/mobileNumber";
import { onMobileNumber } from "~/lib/events";
import { DeleteIconCustom, PaperClipIconCustom } from "~/icons/icon";
import BackButton from "../base/buttons/BackButton";
import {
  backForwardToPage,
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
} from "~/store/ui/action";
import UpdateButton from "../base/buttons/UpdateButton";
import { getStatesAction } from "~/store/state/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import CustomButton from "../base/CustomButton";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import { automateURL } from "~/plugins";
import checkMobileScreen from "~/plugins/checkMobileScreen";
import PubListingMobilePreview from "./PubListingMobilePreview";
import CustomSelect from "../base/CustomSelect";
import userTypes from "~/enums/userTypes";
import CopyURLComponent from "../base/CopyURLComponent";

const { TextArea } = InputAntd;
let timeout = setTimeout(function () {}, 0);

let onSelectSugestion = false;

const AddUpdateCompany = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const fileInput = useRef(null);
  const submitButton = useRef(null);

  const {
    state,
    stateMetaData,
    stateLoading,
    hubspotCompanyList,
    hubspotLoading,
    stepper,
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      state: state.licenseStates.states.data,
      stateMetaData: state.licenseStates.metaData,
      stateLoading: state.licenseStates.states.loading,
      hubspotCompanyList: state.company.hubspot_company_list.company,
      hubspotLoading: state.company.hubspot_company_list.loading,
      stepper: state.ui.stepper,
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  const { user } = useSelector((state) => {
    return {
      user: state.auth.data,
    };
  }, shallowEqual);

  const { pricingEngineList, pricingEngineLoading } = useSelector((state) => {
    return {
      pricingEngineList: state.pricingEngine.pricing.data,
      pricingEngineLoading: state.pricingEngine.pricing.loading,
    };
  }, shallowEqual);

  const [isModal, setIsModal] = useState(false);

  const [hubsoptSelection, SetHubspotSection] = useState({
    isSelected: false,
    hubspotSelected: {},
  });

  const { company, loading, isUpdate } = useSelector(
    (state) => state.company.myCompany,
    shallowEqual
  );

  const [selectedLicenseState, setSelectedLicenseState] = useState({
    dynamicSelection: [],
    domElement: [],
  });

  const [removeFromTheDom, setRemoveFromTheDom] = useState([]);

  const [theme, setTheme] = useState({
    headerTextColor: "#fff", //default
    file: null,
    preview: null,
    oldPreview: null,
    name: "",
    percent: 0,
    isDone: false,
    // isMove: false,
  });

  const [onProgress, setOnProgress] = useState(false);

  const [totalAdditionalDetails, setTotalAdditionalDetails] = useState(0);

  const characterCount = useMemo(
    () => totalAdditionalDetails,
    [totalAdditionalDetails]
  );

  const [equalHousing, setEqualHousing] = useState({
    EHL: false,
    EHO: false,
  });
  const [selectedCompany, setSelectedCompany] = useState(false);

  const [isNMLSUnique, setIsNMLSUnique] = useState(false);

  // const [allowAccessToBuyerApp, setAllowAccessToBuyerApp] = useState(false); for future purpose

  const [allowLoanOfficerToUploadLogo, setAllowLoanOfficerToUploadLogo] =
    useState(false);

  const [headerBackgroungColor, setHeaderBackgroungColor] = useState("#0662C7");

  useEffect(() => {
    if (!pricingEngineLoading && !isUpdate) {
      if (user.isAuthenticated) {
        form.setFields([
          {
            name: "pricing_engine",
            value: {
              label: user.user.pricing_engine.name,
              value: user.user.pricing_engine.id,
            },
          },
        ]);
      }
    }
  }, [pricingEngineLoading, isUpdate, user]);

  useEffect(() => {
    if (!isUpdate) {
      setSelectedLicenseState({
        ...selectedLicenseState,
        domElement: [
          {
            name: 0,
            key: 0,
            isListField: true,
            fieldKey: 0,
          },
        ],
      });
    }
  }, [isUpdate]);

  useEffect(() => {
    if (!loading && !stateLoading && !pricingEngineLoading) {
      if (isUpdate) {
        if (Object.keys(company).length > 0) {
          for (const key in company) {
            /**
             * Format the mobile number
             * when update
             */
            if (key === "company_mobile_number") {
              validateMobileNumber(company[key], form, key, submitButton);
              continue;
            }

            /**
             * State
             */
            if (key === "state" && typeof company[key] === "string") {
              const stateResult = state.find(
                (f) => f.value.split(" - ")[0] === company[key].split(" - ")[0]
              );
              if (stateResult) {
                company[key] = {
                  label: stateResult.label,
                  value: stateResult.value,
                };
              }
            }

            form.setFields([
              {
                name: `${key}`,
                value: company[key],
              },
            ]);
          }
          const pricingEngineResult = pricingEngineList.find(
            (v) => v.value === company.pricing_engine_id
          );
          if (pricingEngineResult) {
            form.setFields([
              {
                name: "pricing_engine",
                value: {
                  label: pricingEngineResult.label,
                  value: pricingEngineResult.value,
                },
              },
            ]);
          }

          setTotalAdditionalDetails(
            company.additional_details ? company.additional_details.length : 0
          );

          setAllowLoanOfficerToUploadLogo(
            company.allow_loan_officer_to_upload_logo === 1 ? true : false
          );

          /**
           * For future purpose           
            // setAllowAccessToBuyerApp(
            //   company.allow_access_to_buyer_app === 1 ? true : false
            // );
          */

          const forPreview = company.company_logo
            ? `${config.storagePath}${company.company_logo}`
            : null;

          setTheme({
            ...theme,
            preview: forPreview,
            oldPreview: forPreview,
            headerTextColor: company.header_text_color,
          });
          setHeaderBackgroungColor(company.header_background_color);
          const headerTextColor = document.querySelectorAll(".headerTextColor");
          if (headerTextColor) {
            if (headerTextColor.length > 0) {
              headerTextColor.forEach((element) => {
                if (element.value === company.header_text_color) {
                  element.checked = true;
                }
              });
            }
          }
          //Equal Housing
          setEqualHousing({
            ...equalHousing,
            EHL:
              company.equal_housing == "equal_housing_lender"
                ? true
                : equalHousing.EHL,
            EHO:
              company.equal_housing == "equal_housing_opportunity"
                ? true
                : equalHousing.EHO,
          });

          if (company.licenseState.length > 0) {
            stateStateLicense(company.licenseState, state);
          }

          setSelectedCompany(true);
          setIsNMLSUnique(true);
        }
      }
    }
  }, [
    company,
    loading,
    isUpdate,
    stateLoading,
    pricingEngineLoading,
    pricingEngineList,
  ]);

  /**
   * Statice state licence that has not remove from the dom
   * @param {Array} stateLicence
   * @param {Array} listOfState
   * @returns {void}
   *
   */
  const stateStateLicense = (stateLicence, listOfState) => {
    const { domElement, dynamicSelection, dynamicSelectionMetaData } =
      helPerSetFormValue(stateLicence, listOfState);

    setSelectedLicenseState({
      ...selectedLicenseState,
      domElement: domElement,
      dynamicSelection: dynamicSelection,
    });

    dispatch({
      type: STATES.UPDATE_SET_INITIAL_STATE_META_DATA,
      payload: dynamicSelectionMetaData,
    });
  };

  const helPerSetFormValue = (stateLicence, listOfState) => {
    let domElementUpdate = [],
      dynamicSelectionUpDate = [],
      dynamicSelectionUpDateMetaData = [],
      licenseState = [],
      address = [],
      checkBoxRadio = [],
      metaFor = [];
    let isDoneSettingTheState = false;

    for (let ii = 0; ii < stateLicence.length; ii++) {
      domElementUpdate.push({
        name: ii,
        key: ii,
        isListField: true,
        fieldKey: ii,
      });
      const metadata = stateLicence[ii].license.metadata;
      const license = stateLicence[ii].license.license;
      const state_id = stateLicence[ii].license.state_id;
      const stateUpdate = listOfState.find((s) => s.key === state_id);

      if (stateUpdate) {
        licenseState.push({
          licenseState: {
            label: stateUpdate.label,
            value: stateUpdate.value,
          },
          licenseNumber: license,
        });
        dynamicSelectionUpDate.push({
          id: `selection-${ii}`,
          name: stateUpdate.value,
          label: stateUpdate.label,
          value: stateUpdate.value,
        });

        dynamicSelectionUpDateMetaData.push({
          ...stateUpdate,
          metadata: null,
          id: `selection-${ii}`,
          selected: true,
          laseSelected: null,
        });

        if (metadata.length > 0) {
          for (const metaUpdate of metadata) {
            if (
              trimTheState(stateUpdate.value) === trimTheState(metaUpdate.name)
            ) {
              if (!stateUpdate.metadata) {
                metaFor.push({
                  stateFor: stateUpdate.value,
                  metadata: metaUpdate,
                });
                metaUpdate.validation.forEach((el) => {
                  el.selection.forEach((re) => {
                    if (el.name === "Branch Address") {
                      address.push({
                        [re.full_title]: re.value,
                        stateFor: metaUpdate.name,
                        addressFor: metaUpdate.name,
                      });
                    }

                    if (re.checked) {
                      checkBoxRadio.push({
                        value: re.value,
                        stateFor: metaUpdate.name,
                        name: el.name,
                        check: re.checked,
                      });
                    }
                  });
                });
              }
            }
          }
        }
      }
    }

    /**
     * Fixed the bug of the state licence and license number
     * Set the license state and license number
     */

    for (const keyLicenseState in licenseState) {
      if (Object.hasOwnProperty.call(licenseState, keyLicenseState)) {
        const element = licenseState[keyLicenseState];
        setTimeout(() => {
          form.setFields([
            {
              name: ["stateLicence", keyLicenseState, "licenseState"],
              value: element.licenseState,
            },
            {
              name: ["stateLicence", keyLicenseState, "licenseNumber"],
              value: element.licenseNumber,
            },
          ]);
        }, 0);
      }
    }

    const interval = setInterval(() => {
      const fields = form.getFieldsValue();

      if (fields.stateLicence) {
        clearInterval(interval);
        isDoneSettingTheState = true;
        const resultsss = licenseState.map((result) => {
          if (checkBoxRadio.length > 0) {
            checkBoxRadio.map((el) => {
              if (
                trimTheState(result.licenseState.value) ===
                trimTheState(el.stateFor)
              ) {
                result = {
                  ...result,
                  [el.name]: el.value,
                };
              }
              return el;
            });
            //map the address
            if (address.length > 0) {
              address.forEach((ad) => {
                if (
                  trimTheState(result.licenseState.value) ===
                  trimTheState(ad.stateFor)
                ) {
                  result = {
                    ...result,
                    ...ad,
                  };
                }
              });
            }
          }
          delete result.stateFor;
          return result;
        });

        form.setFieldsValue({
          stateLicence: resultsss,
        });
      }
    }, 1000);

    setTimeout(() => {
      if (!isDoneSettingTheState) {
        clearInterval(interval);
      }
    }, 1100);

    dynamicSelectionUpDateMetaData = dynamicSelectionUpDateMetaData.map(
      (dy) => {
        if (metaFor.length > 0) {
          metaFor.map((mf) => {
            if (dy.value === mf.stateFor) {
              dy.metadata = mf.metadata;
            }
          });
        }
        return dy;
      }
    );

    return {
      domElement: domElementUpdate,
      dynamicSelection: dynamicSelectionUpDate,
      dynamicSelectionMetaData: dynamicSelectionUpDateMetaData,
    };
  };

  const onSelectImage = () => fileInput?.current.click();

  const onFileChange = (e) => {
    const [file] = e.target.files || e.dataTransfer.files;
    if (file) {
      setTheme({
        ...theme,
        name: "",
        percent: 0,
        isDone: false,
        file: null,
        preview: isUpdate ? theme.preview : null,
        oldPreview: isUpdate ? theme.preview : null,
      });

      const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedImageTypes.includes(file.type)) {
        snackBar(
          "Not a valid image file",
          "Please upload a valid image file. (jpg, jpeg, png)",
          "error"
        );

        if (e.type !== "drop") {
          e.target.value = "";
        }
        return false;
      }

      setTheme({
        ...theme,
        name: file.name,
        percent: 0,
        isDone: false,
        file: null,
        preview: isUpdate ? theme.preview : null,
        oldPreview: isUpdate ? theme.preview : null,
      });

      const reader = new FileReader();

      const imageIsReady = (imgFile, url) => {
        // setIsTouch(true);

        onPropagation(true, false);

        setTimeout(() => {
          setTheme({
            ...theme,
            name: file.name,
            percent: 100,
            isDone: true,
            file: imgFile,
            preview: url,
          });
        }, 500);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setTheme({
            ...theme,
            percent: Math.round(progress),
            name: file.name,
          });
        }
      };

      reader.onload = (event) => {
        const imageUrl = event.target.result;
        const image = new Image();
        image.src = imageUrl;
        image.onload = async () => {
          if (image.width < 200 || image.height < 100) {
            setTheme({
              ...theme,
              name: "",
              percent: 0,
              isDone: false,
              file: null,
              preview: isUpdate ? theme.preview : null,
              oldPreview: isUpdate ? theme.preview : null,
            });
            snackBar(
              "Image is too small",
              "Image size should be minimum 200px width and 100px height",
              "error"
            );
            e.target.value = "";

            return false;
          }
          if (image.width > 500 || image.height > 250) {
            const result = await autoCrop(file, 500, 250);
            const isValid = result instanceof File;
            if (isValid) {
              imageIsReady(file, imageUrl);
            }
            e.target.value = "";
            return;
          }

          imageIsReady(file, imageUrl);
        };
      };

      reader.readAsDataURL(file);
      if (e.type !== "drop") {
        e.target.value = "";
      }
    }
  };

  const defualtStateLicenseSelection = (value, id) => {
    const selectedOption = document.getElementById(id);
    let selected = null;
    if (value) {
      const md = stateMetaData.find((f) => f.name === trimTheState(value));
      if (md) {
        selected = md;
      }
    }

    if (selectedOption) {
      if (selectedOption.id == id) {
        const attributeValue = selectedOption.getAttribute("data-value");
        if (attributeValue == "") {
          selectedOption.setAttribute("data-value", value);
          selectedLicenseStateChange(value, attributeValue, id);

          if (isUpdate) {
            const toRemove = selectedLicenseState.dynamicSelection.find(
              (f) => f.id == id
            );
            if (toRemove) {
              dispatch({
                type: STATES.SELECTED_STATE,
                payload: {
                  value,
                  id,
                  metadata: selected,
                  laseSelected: toRemove.name,
                },
              });
              selectedLicenseStateChange(value, toRemove.name, id);
            } else {
              dispatch({
                type: STATES.SELECTED_STATE,
                payload: {
                  value,
                  id,
                  metadata: selected,
                  laseSelected: null,
                },
              });
            }
          } else {
            dispatch({
              type: STATES.SELECTED_STATE,
              payload: {
                value,
                id,
                metadata: selected,
                laseSelected: null,
              },
            });
          }

          dispatch({
            type: STATES.SELECTED_STATE,
            payload: {
              value,
              id,
              metadata: selected,
              laseSelected: null,
            },
          });
        } else {
          selectedOption.setAttribute("data-value", value);
          selectedLicenseStateChange(value, attributeValue, id);
          dispatch({
            type: STATES.SELECTED_STATE,
            payload: {
              value,
              id,
              metadata: selected,
              laseSelected: attributeValue,
            },
          });
        }
      }
    }

    if (isUpdate) {
      removeInRestore(value);
    }
  };

  const selectedLicenseStateChange = (value, laseSelected, id) => {
    if (laseSelected) {
      const newDynamicSelection = selectedLicenseState.dynamicSelection.filter(
        (item) => item.name !== laseSelected
      );
      setSelectedLicenseState({
        ...selectedLicenseState,
        dynamicSelection: [...newDynamicSelection, { name: value, id }],
      });
    } else {
      setSelectedLicenseState({
        ...selectedLicenseState,
        dynamicSelection: [
          ...selectedLicenseState.dynamicSelection,
          {
            name: value,
            id,
          },
        ],
      });
    }
  };

  const onSubmitForm = async (submit, state, update) => {
    if (!update) {
      if (!selectedCompany) {
        form.setFields([
          {
            name: "name",
            errors: [`Please select a company from the list.`],
          },
        ]);
        snackBar("Please select a company from the list.", "", "error");

        return false;
      }
    }

    if (!isNMLSUnique) {
      form.setFields([
        {
          name: "company_nmls_number",
          errors: [`The Company NMLS number already exist`],
        },
      ]);
      snackBar("The Company NMLS number already exist.", "", "error");

      return false;
    }

    setOnProgress(true);
    const formData = new FormData();
    let stateLicense = [],
      metaData = [];

    //Dynamic license state
    if (submit.stateLicence) {
      if (submit.stateLicence.length > 0) {
        for (let i = 0; i < submit.stateLicence.length; i++) {
          const element = submit.stateLicence[i];
          if (element.licenseState) {
            const hasMetaData = state.find(
              (st) =>
                trimTheState(st.value) ===
                trimTheState(element.licenseState.value)
            );
            if (hasMetaData) {
              stateLicense.push({
                license: {
                  state_id: hasMetaData.key,
                  license_number: element.licenseNumber,
                  isRemove: false,
                },
              });
              if (hasMetaData.metadata) {
                metaData.push(hasMetaData.metadata);
              }
            }
          }
        }
      }
    }

    if (update) {
      if (props.hasOwnProperty("onboarding")) {
        formData.append("id", props.onboarding.company.id);
      } else {
        const { pathname } = new URL(window.location.href);
        const companyId = pathname.split("/").pop();
        formData.append("id", companyId);
      }

      if (company.licenseState) {
        if (company.licenseState.length > 0) {
          company.licenseState.map((obj) => {
            removeFromTheDom.map((removeId) => {
              if (removeId == obj.license.state_id) {
                stateLicense.push({
                  license: {
                    state_id: obj.license.state_id,
                    license_number: obj.license.license,
                    isRemove: true,
                  },
                });
              }
            });
          });
        }
      }
    }

    //append the form data of if the file is not null
    if (theme.file) {
      formData.append("company_logo", theme.file);
    }
    //hubspot selection: Run if not update
    if (!update) {
      formData.append(
        "is_enterprise",
        hubsoptSelection.hubspotSelected.is_enterprise
      );
      formData.append(
        "enterprise_max_users",
        hubsoptSelection.hubspotSelected.enterprise_max_users
      );
      formData.append(
        "hubspot_company_id",
        hubsoptSelection.hubspotSelected.hubspot_company_id
      );
    }

    //pricing enging selection
    formData.append("name", update ? submit.name : submit.name.value);
    formData.append("header_background_color", headerBackgroungColor);
    formData.append("header_text_color", theme.headerTextColor);
    formData.append(
      "company_privacy_policy_URL",
      submit.company_privacy_policy_URL
    );
    formData.append(
      "company_terms_of_tervice_URL",
      submit.company_terms_of_tervice_URL
        ? submit.company_terms_of_tervice_URL
        : ""
    );
    formData.append("has_company_msa", false);
    formData.append("address", submit.address);
    formData.append("city", submit.city);
    formData.append("state", submit.state.value);
    formData.append("zip", submit.zip);
    formData.append("company_nmls_number", submit.company_nmls_number);
    formData.append("company_mobile_number", submit.company_mobile_number);
    formData.append("license", JSON.stringify(stateLicense));
    formData.append("pricing_engine_id", submit.pricing_engine.value);
    formData.append(
      "additional_details",
      submit.additional_details ? submit.additional_details : ""
    );
    formData.append("state_metadata", JSON.stringify(metaData));
    formData.append("equal_housing", submit.equal_housing);
    // formData.append('allow_access_to_buyer_app', allowAccessToBuyerApp); for future purpose
    formData.append(
      "allow_loan_officer_to_upload_logo",
      allowLoanOfficerToUploadLogo
    );

    let response = update
      ? await dispatch(updateCompanyAction(formData.get("id"), formData, form))
      : await dispatch(createCompanyAction(formData, form));

    if (response) {
      const numUserType = Number(user.user.user_type_id);
      setOnProgress(false);
      setTheme({
        ...theme,
        headerTextColor: "#fff",
        name: "",
        percent: 0,
        isDone: false,
        file: null,
        preview: null,
        oldPreview: null,
      });
      stateLicense = [];
      metaData = [];

      if (numUserType === userTypes.COMPANY_ADMIN) {
        // setIsTouch(false);
        dispatch({
          type: "MY_COMPANY",
          payload: {
            loading: true,
            company: {},
            isUpdate: true,
          },
        });
        dispatch(getCompanyAction(company.id, true));
        dispatch(getStatesAction());
        dispatch(getPricingEngineAction());
        const main = document.querySelector("main");
        if (main) {
          if (main.scrollHeight > main.clientHeight) {
            main.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }
        }
      } else {
        router.push("/company");
      }
      onPropagation(false, false);
      formChangeRemove();
    } else {
      setOnProgress(false);
      //if fail the request
      stateLicense = [];
      metaData = [];
    }
  };

  const addDom = () => {
    const ccc = selectedLicenseState.domElement.at(-1).key + 1;
    const addObj = {
      name: ccc,
      key: ccc,
      isListField: true,
      fieldKey: ccc,
    };

    setSelectedLicenseState({
      ...selectedLicenseState,
      domElement: [...selectedLicenseState.domElement, addObj],
    });
  };

  const remove = (index, itemArr, id) => {
    const rmDom = itemArr.find((sss) => sss.id === id);

    if (rmDom) {
      dispatch({
        type: STATES.ON_REMOVE_TO_DOM,
        payload: {
          value: rmDom.name,
        },
      });
      let stateLicence = form.getFieldsValue("stateLicence");
      const rmStateArr = stateLicence.stateLicence.map((it) => {
        if (it) {
          if (it.licenseState || it.licenseNumber) {
            if (it.licenseState.value === rmDom.name) {
              it = {
                licenseState: undefined,
                licenseNumber: undefined,
              };
            }
          }
        }

        return it;
      });
      form.setFieldsValue({
        stateLicence: rmStateArr,
      });

      if (isUpdate) {
        removeInRestore(rmDom.name);
      }
    }
    setSelectedLicenseState({
      ...selectedLicenseState,
      domElement: selectedLicenseState.domElement.filter(
        (item) => item.key !== index
      ),
      dynamicSelection: rmDom
        ? selectedLicenseState.dynamicSelection.filter(
            (dy) => dy.name !== rmDom.name
          )
        : selectedLicenseState.dynamicSelection,
    });
  };

  const removeInRestore = (name) => {
    const stateKey = state.find((st) => st.value === name);
    if (stateKey) {
      const removeFromUpdate = company.licenseState.find(
        (stateUpdate) => stateUpdate.license.state_id === stateKey.key
      );
      if (removeFromUpdate) {
        const index = removeFromTheDom.findIndex(
          (rm) => rm == removeFromUpdate.license.state_id
        );
        if (index === -1) {
          setRemoveFromTheDom([
            ...removeFromTheDom,
            removeFromUpdate.license.state_id,
          ]);
        } else {
          const restore = removeFromTheDom.filter(
            (f) => f != removeFromTheDom[index]
          );
          setRemoveFromTheDom(restore);
        }
      }
    }
  };

  /**
   * Handle the check box change in radio button selection
   * @param {Event} e
   * @param {String} value
   * @param {String} tyepeofCheck
   * @param {Number} key
   * @param {String} name
   * @returns {Void} void
   */
  const onCheckChange = (e, value, tyepeofCheck, key, name) => {
    dispatch({
      type: STATES.ON_CHECK_CHANGE,
      payload: {
        key,
        name,
        value,
        checked: e.target.checked,
      },
    });
  };

  /**
   * Check the company name in NMLS number
   * @param {Event} e
   * @param {String} typeOfCheck
   * @param {Boolean} update
   */

  const onCheckCompanyNameInNMLSUmber = (
    value,
    typeOfCheck,
    update,
    typing
  ) => {
    const obj = {};
    const next = () => {
      if (value) {
        onChecking(obj, typeOfCheck);
      }
    };
    if (update || typing) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (user.user) {
          if (props.hasOwnProperty("onboarding")) {
            obj.isUpdateId = props.onboarding.company.id;
          } else {
            const { pathname } = new URL(window.location.href);
            obj.isUpdateId = pathname.split("/").pop();
          }

          obj[typeOfCheck] = value;
          obj.id = user.user.user_type_id;
          next();
        }
      }, 1000);
    } else {
      //request immediately
      obj[typeOfCheck] = value;
      obj.isUpdateId = null;
      obj.id = user.user.user_type_id;
      next();
    }
  };

  /**
   * Check the company name in NMLS number
   * @param {Object} reqObj
   * @param {String} typeOfCheck
   * @param {Boolean} checkRUnOnce
   * @returns {Promise<Boolean>}  true or false
   */

  const onChecking = async (reqObj, typeOfCheck) => {
    try {
      const controller = new AbortController();
      const { signal } = controller;
      const result = await checkUniqueCompanyCompanyNMLSUmberAPI(
        reqObj,
        signal
      );

      if (result.status === 200) {
        if (!result.data.success) {
          snackBar(result.data.message, "", "error");

          if (typeOfCheck === "name") {
            setSelectedCompany(false);
            form.setFields([
              {
                name: "name",
                errors: [`${result.data.message}`],
              },
            ]);
          } else if (typeOfCheck === "company_nmls_number") {
            setIsNMLSUnique(false);
            form.setFields([
              {
                name: "company_nmls_number",
                errors: [`${result.data.message}`],
              },
            ]);
          }
        } else {
          if (typeOfCheck === "name") {
            setSelectedCompany(true);
            if (onSelectSugestion) {
              autoCompleteOnSelect(reqObj.name);
              onSelectSugestion = false;
            }
          } else if (typeOfCheck === "company_nmls_number") {
            setIsNMLSUnique(true);
            form.setFields([
              {
                name: "company_nmls_number",
                errors: [],
              },
            ]);
          }
        }
      }
    } catch (error) {
      onHandleError(error, dispatch);
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

  const autoCompleteOnSelect = (result) => {
    form.resetFields();

    if (result) {
      setSelectedCompany(true);
      onChecking(
        {
          company_nmls_number: result.properties.company_nmls_,
          isUpdateId: null,
          id: user.user.user_type_id,
        },
        "company_nmls_number"
      );

      setOnProgress(true);

      const fields = form.getFieldsValue();
      if (result.properties.hasOwnProperty("privacy_policy_url")) {
        result.properties["company_privacy_policy_URL"] =
          result.properties["privacy_policy_url"];
        delete result.properties["privacy_policy_url"];
      }

      if (result.properties.hasOwnProperty("company_nmls_")) {
        result.properties["company_nmls_number"] =
          result.properties["company_nmls_"];
      }

      if (result.properties.hasOwnProperty("phone")) {
        result.properties["company_mobile_number"] = result.properties["phone"];
        delete result.properties["phone"];
      }

      for (const key in fields) {
        if (key !== "stateLicence") {
          if (result.properties[key]) {
            if (key == "company_mobile_number") {
              validateMobileNumber(
                result.properties[key],
                form,
                key,
                submitButton
              );
              continue;
            }
            if (key === "state") {
              for (const states of state) {
                const hubspotCompanyState = result.properties[key];
                if (
                  states.value === hubspotCompanyState ||
                  states.value.split(" - ")[0] === hubspotCompanyState
                ) {
                  form.setFields([{ name: `${key}`, value: states }]);
                  break;
                }
              }
              continue;
            }

            if (key === "pricing_engine") {
              const pricingEngineValue = pricingEngineList.find(
                (s) => s.label === result.properties.pricing_engine
              );

              if (pricingEngineValue) {
                form.setFields([
                  { name: "pricing_engine", value: pricingEngineValue },
                ]);
              }
              continue;
            }

            if (key === "name") {
              form.setFields([{ name: "name", value: result }]);
              continue;
            }

            form.setFields([{ name: `${key}`, value: result.properties[key] }]);
          }
        }
      }
      SetHubspotSection({
        ...hubsoptSelection,
        isSelected: true,
        hubspotSelected: {
          ...hubsoptSelection.hubspotSelected,
          hubspot_company_id: result.id,
          enterprise_max_users: result.properties.enterprise_max_users
            ? Number(result.properties.enterprise_max_users)
            : 0,
          is_enterprise: result.properties.billing_type
            ? result.properties.billing_type === "enterprise"
              ? true
              : false
            : false,
        },
      });
      // }
      setOnProgress(false);
    }
  };

  const isAddCompany = (isLoading) => {
    const { pathname } = new URL(window.location.href);
    const compAdd = pathname.split("/").pop();
    if (compAdd === "add") {
      return false;
    } else {
      if (isUpdate) {
        return isLoading;
      } else {
        return false;
      }
    }
  };

  const onDispatchBack = () => {
    if (url) {
      router.push(url);
    } else {
      window.history.back();
    }
    if (props.hasOwnProperty("viewDetails")) {
      dispatch(getCompanyAction(company.id, true));
      dispatch(getStatesAction());
      dispatch(getPricingEngineAction());
    }
  };

  const appendFullWidth = checkMobileScreen() ? { isfullwidth: true } : {};

  const onPropagation = (change, open, isURL) => {
    dispatch(formDialogAlert(change, open, isURL));
  };

  return (
    <div>
      {!props.hasOwnProperty("onboarding") && (
        <>
          <BackButton
            handleBack={() => {
              if (isChange) {
                onPropagation(true, true, "");
              } else {
                onDispatchBack();
              }
            }}
          />

          <div className="flex flex-col lg:flex-row justify-between items-start mt-10 mb-3">
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center truncate line-clamp-2">
              {isUpdate
                ? props.hasOwnProperty("viewDetails")
                  ? "Company Details"
                  : "Update a company"
                : "Add new company"}
            </h2>
            {props.hasOwnProperty("viewDetails") && !loading && (
              <UpdateButton
                href={`/company/${company.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  router.push(`/company/${company.id}`);
                  dispatch({
                    type: "MY_COMPANY",
                    payload: {
                      loading: true,
                      company: {},
                      isUpdate: true,
                    },
                  });
                }}
              />
            )}
          </div>
          <CustomDivider />
        </>
      )}

      <div className="flex flex-col lg:flex-row gap-10 w-full mt-10">
        <div className="w-full">
          <Form
            name="dynamic_form_item"
            onFinish={(submit) => onSubmitForm(submit, state, isUpdate)}
            form={form}
            disabled={
              onProgress || isUpdate
                ? loading
                  ? true
                  : props.hasOwnProperty("viewDetails")
                : false
            }
            className={
              props.hasOwnProperty("viewDetails")
                ? "view-mode"
                : isUpdate
                ? "view-mode"
                : props.hasOwnProperty("onboarding")
                ? "view-mode"
                : ""
            }
            scrollToFirstError={true}
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
            <div className="border border-solid border-alice-blue box-border rounded-3xl p-8 w-full">
              <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                Company Information
              </div>

              <div>
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="relative flex-1 auto-complete">
                    <CustomFormItem
                      label="Company Name"
                      name="name"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {isUpdate || props.hasOwnProperty("onboarding") ? (
                        loading ? (
                          <Skeleton.Input active size="default" />
                        ) : (
                          <CustomInput
                            type="text"
                            onChange={(e) =>
                              onCheckCompanyNameInNMLSUmber(
                                e.target.value,
                                "name",
                                isUpdate,
                                true
                              )
                            }
                          />
                        )
                      ) : (
                        <CustomSelect
                          options={hubspotCompanyList}
                          disabled={hubspotLoading}
                          placeholder="Enter Company Name"
                          onChange={(opt) => autoCompleteOnSelect(opt)}
                          withsearch="true"
                        />
                      )}
                    </CustomFormItem>

                    {/* <div
                        style={{
                          position: "absolute",
                          top: "30px",
                          right: "15px",
                        }}
                      >
                        <LoadingOutlined />
                      </div> */}
                  </div>
                  <div className="flex-2">
                    <CustomFormItem
                      label="Company NMLS#"
                      name="company_nmls_number"
                      // required
                      // rules={config.requiredRule}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          onChange={(e) => {
                            if (e.target.value) {
                              onCheckCompanyNameInNMLSUmber(
                                e.target.value,
                                "company_nmls_number",
                                isUpdate,
                                true
                              );
                            } else {
                              setTimeout(() => {
                                form.setFields([
                                  { name: "company_nmls_number", errors: [] },
                                ]);
                              }, 0);
                            }
                          }}
                          placeholder="Enter Company NMLS#"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </div>

                <div className="flex flex-col ld:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <CustomFormItem
                      label="Company Privacy Policy URL"
                      name="company_privacy_policy_URL"
                      required
                      rules={[
                        { required: true, message: "This field is required." },
                      ]}

                      // rules={config.requiredRule.concat(config.urlRule)}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Company Privacy Policy"
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
                              "company_privacy_policy_URL",
                              true
                            );
                          }}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1">
                    <CustomFormItem
                      label="Company Terms of Service URL"
                      name="company_terms_of_tervice_URL"
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Company Terms of Service"
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
                              "company_terms_of_tervice_URL",
                              false
                            );
                          }}
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 w-full">
                  <div className="flex-1 numeric_number">
                    <CustomFormItem
                      label="Company Phone Number"
                      name="company_mobile_number"
                      required
                      rules={config.requiredRule}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Company Phone Number"
                          onKeyDown={onMobileNumber}
                          onChange={(event) =>
                            validateMobileNumber(
                              event.target.value,
                              form,
                              "company_mobile_number",
                              submitButton
                            )
                          }
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 numeric_number">
                    <CustomFormItem
                      label="Price Engine"
                      name="pricing_engine"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select Price Engine"
                          options={pricingEngineList}
                          className="text-neutral-2 font-sharp-sans-medium"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </div>

                <div className="flex justify-center items-center gap-4 w-full">
                  <div className="flex-1">
                    <CustomFormItem
                      label="Corporate Address"
                      name="address"
                      required
                      rules={config.requiredRule}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput
                          type="text"
                          placeholder="Enter Corporate Address"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 w-full">
                  <div className="flex-1">
                    <CustomFormItem
                      label="City"
                      name="city"
                      required
                      rules={config.requiredRule}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="text" placeholder="Enter City" />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1">
                    <CustomFormItem
                      label="State"
                      name="state"
                      required
                      rules={config.requiredRule.slice(0, 1)}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomSelect
                          placeholder="Select State"
                          options={state}
                          withsearch="true"
                          statesearch="true"
                        />
                      )}
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 numeric_number">
                    <CustomFormItem
                      label="Zip"
                      name="zip"
                      required
                      rules={config.requiredRule}
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <CustomInput type="number" placeholder="Enter Zip" />
                      )}
                    </CustomFormItem>
                  </div>
                </div>

                <div>
                  <CustomFormItem
                    label="Equal Housing"
                    name="equal_housing"
                    required
                    rules={config.requiredRule}
                  >
                    <Radio.Group
                      value={
                        equalHousing.EHL
                          ? "equal_housing_lender"
                          : equalHousing.EHO
                          ? "equal_housing_opportunity"
                          : ""
                      }
                      disabled={props.hasOwnProperty("viewDetails")}
                      className={`input-radio ${
                        props.hasOwnProperty("viewDetails") && "view-only"
                      }`}
                    >
                      <Radio
                        value={"equal_housing_lender"}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setEqualHousing({
                              ...equalHousing,
                              EHL: true,
                              EHO: false,
                            });
                          }
                        }}
                      >
                        <div className="flex justify-center items-center gap-2">
                          <img
                            src={`${window.location.origin}/icon/${
                              props.hasOwnProperty("viewDetails")
                                ? "equal_housing_lender_disabled.png"
                                : "equal_housing_lender.png"
                            } `}
                            alt="equal-housing-lender-1-logo-png-transparent"
                            className="w-14 min-w-14 max-w-14 h-14 min-h-14 max-h-14"
                          />
                          <div
                            className={`text-1 font-sharp-sans-regular text-center ${
                              props.hasOwnProperty("viewDetails")
                                ? "text-gray-3"
                                : "text-neutral-1"
                            }`}
                          >
                            Equal Housing Lender (EHL)
                          </div>
                        </div>
                      </Radio>
                      <Radio
                        value={"equal_housing_opportunity"}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setEqualHousing({
                              ...equalHousing,
                              EHO: true,
                              EHL: false,
                            });
                          }
                        }}
                      >
                        <div className="flex justify-center items-center gap-2">
                          <img
                            src={`${window.location.origin}/icon/${
                              props.hasOwnProperty("viewDetails")
                                ? "equal_housing_opportunity_disabled.png"
                                : "equal_housing_opportunity.png"
                            } `}
                            alt="equal-housing-opportunity-logo-png-transparent"
                            className="w-14 min-w-14 max-w-14 h-14 min-h-14 max-h-14"
                          />
                          <div
                            className={`text-1 font-sharp-sans-regular text-center ${
                              props.hasOwnProperty("viewDetails")
                                ? "text-gray-3"
                                : "text-neutral-1"
                            }`}
                          >
                            Equal Housing Opportunity (EHO)
                          </div>
                        </div>
                      </Radio>
                    </Radio.Group>
                  </CustomFormItem>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 w-full">
                  {/*
                   For future purpose
                  <div className='flex-1'>
                    <CustomFormItem
                      label='Buyer App'
                      name='allow_access_to_buyer_app'
                    >
                      <div className='input-check-box flex justify-start items-center'>
                        <Checkbox
                          className='font-sharp-sans-medium text-neutral-2'
                          checked={allowAccessToBuyerApp}
                          onChange={(_) =>
                            setAllowAccessToBuyerApp(!allowAccessToBuyerApp)
                          }
                        >
                          Enable access to Buyer App
                        </Checkbox>
                      </div>
                    </CustomFormItem>
                  </div> */}
                  <div className="flex-1">
                    <CustomFormItem
                      label="Custom logo"
                      name="allow_loan_officer_to_upload_logo"
                    >
                      {isAddCompany(loading) ? (
                        <Skeleton.Input active size="default" />
                      ) : (
                        <div
                          className={`input-check-box ${
                            props.hasOwnProperty("viewDetails") && "view-only"
                          } flex justify-start items-center`}
                        >
                          <Checkbox
                            className="font-sharp-sans-medium text-neutral-2"
                            checked={allowLoanOfficerToUploadLogo}
                            onChange={(_) =>
                              setAllowLoanOfficerToUploadLogo(
                                !allowLoanOfficerToUploadLogo
                              )
                            }
                          >
                            Allow Loan Officer to upload logo
                          </Checkbox>
                        </div>
                      )}
                    </CustomFormItem>
                  </div>
                  {isUpdate && (
                    <CopyURLComponent
                      url={company?.login_url}
                      label="Login URL"
                      isLoading={loading}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* Theme */}
            <div className="border border-solid border-alice-blue box-border rounded-3xl p-8 w-full mt-9">
              <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                Theme
              </div>

              <div className="color-oicker flex flex-col lg:flex-row gap-4 w-full">
                <div className="flex-1">
                  <div className="text-13 text-neutral-1 font-sharp-sans-regular truncate line-clamp-2">
                    Header Background Color{" "}
                    <span className="text-error">*</span>
                  </div>

                  {isAddCompany(loading) ? (
                    <Skeleton.Input active size="default" />
                  ) : (
                    <div className="flex gap-3">
                      <div
                        style={{
                          backgroundColor: headerBackgroungColor,
                          width: "197px",
                          height: "40px",
                          borderRadius: "4px",
                          border: "1px solid #DBE1E8",
                          transition: "backgroundColor 0.3s ease",
                        }}
                        className="header-background-color"
                        data-header-background-color="#0662C7"
                      />
                      <div className="color-picker flex justify-center content-center w-full">
                        <ColorPicker
                          disabled={props.hasOwnProperty("viewDetails")}
                          showText={() => (
                            <img
                              src={`${window.location.origin}/icon/colorPickerIcon.png`}
                              alt="color-picker"
                              loading="lazy"
                            />
                          )}
                          // onChangeComplete={(color) => {
                          //   setHeaderBackgroungColor(color.toHexString());
                          // }}
                          onChange={(color) => {
                            setHeaderBackgroungColor(color.toHexString());
                          }}
                          value={headerBackgroungColor}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-13 text-neutral-1 font-sharp-sans-regular truncate line-clamp-2">
                    Header Text Color <span className="text-error">*</span>
                  </div>
                  {isAddCompany(loading) ? (
                    <Skeleton.Input active size="default" />
                  ) : (
                    <div className="flex flex-col lg:flex-row gap-5">
                      <Radio.Group
                        value={theme.headerTextColor}
                        className={`input-radio ${
                          props.hasOwnProperty("viewDetails") && "view-only "
                        }`}
                      >
                        <Radio
                          value={"#fff"}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setTheme({
                                ...theme,
                                headerTextColor: "#fff",
                              });
                            }
                          }}
                        >
                          <span
                            className={`${
                              props.hasOwnProperty("viewDetails") &&
                              "text-gray-3"
                            }`}
                          >
                            White (Default)
                          </span>
                        </Radio>
                        <Radio
                          value={"#000"}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setTheme({
                                ...theme,
                                headerTextColor: "#000",
                              });
                            }
                          }}
                        >
                          <span
                            className={`${
                              props.hasOwnProperty("viewDetails") &&
                              "text-gray-3"
                            }`}
                          >
                            Black
                          </span>
                        </Radio>
                      </Radio.Group>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`drag-drop-container mt-5 w-full h-32 bg-neutral-7 border-dashed border-2 border-neutral-3 rounded-2xl flex items-center justify-center ${
                  props.hasOwnProperty("viewDetails")
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                draggable="true"
                role="button"
                onClick={
                  props.hasOwnProperty("viewDetails") ? null : onSelectImage
                }
                onDragOver={(event) => {
                  if (props.hasOwnProperty("viewDetails")) return;
                  event.preventDefault();
                  event.stopPropagation();
                  if (
                    event.currentTarget.classList.contains(
                      "drag-drop-container"
                    )
                  ) {
                    event.currentTarget.classList.add(
                      "drag-drop-container-hover"
                    );
                  }
                }}
                onDragLeave={(event) => {
                  if (props.hasOwnProperty("viewDetails")) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.classList.remove(
                    "drag-drop-container-hover"
                  );
                }}
                onDrop={(event) => {
                  if (props.hasOwnProperty("viewDetails")) return;
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.classList.remove(
                    "drag-drop-container-hover"
                  );

                  onFileChange(event);
                }}
              >
                <div
                  className={`flex flex-col items-center justify-center h-full gap-2`}
                >
                  <img
                    src={`${window.location.origin}/icon/uploadIcon.png`}
                    alt="upload-icon"
                  />
                  <div className="text-center">Upload a Logo</div>
                  <div className="text-center">Maximum Upload Size: 0.5MB</div>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    style={{
                      visibility: "hidden",
                      width: "0px",
                      height: "0px",
                    }}
                    ref={fileInput}
                    accept="image/png, image/jpg, image/jpeg"
                    onChange={
                      props.hasOwnProperty("viewDetails") ? null : onFileChange
                    }
                  />
                </div>
              </div>

              {theme.name && (
                <div className="flex justify-start justify-items-center items-center w-full gap-3 mt-3">
                  {!theme.isDone && (
                    <div className="h-auto">
                      <LoadingOutlined />
                    </div>
                  )}
                  <div className="flex flex-col content-center w-full">
                    <div className="flex justify-items-center items-center justify-between">
                      <div className="flex content-start justify-items-center items-center gap-2">
                        <PaperClipIconCustom fill="red" />
                        <div
                          style={{
                            color: theme.isDone ? "red" : "#000",
                          }}
                        >
                          {theme.name}
                        </div>
                      </div>
                      {theme.isDone && (
                        <DeleteIconCustom
                          fill="red"
                          style={{ cursor: "pointer" }}
                          onClick={(_) =>
                            setTheme({
                              ...theme,
                              file: null,
                              preview: theme.oldPreview ?? null,
                              name: "",
                              percent: 0,
                              isDone: false,
                            })
                          }
                        />
                      )}
                    </div>

                    {!theme.isDone && (
                      <Progress percent={theme.percent} showInfo={false} />
                    )}
                  </div>
                </div>
              )}

              {theme.preview && (
                <div className="w-full my-3 lg:my-6">
                  <p className="text-17 font-sharp-sans-bold text-neutral-1 mt-2 mb-0 truncate line-clamp-2">
                    Preview
                  </p>
                  <div
                    className="w-[300px] h-[100px] bg-center bg-no-repeat bg-contain"
                    style={{
                      backgroundImage: theme.preview
                        ? `url(${theme.preview})`
                        : "none",
                    }}
                  ></div>
                </div>
              )}

              <div className="mt-3">
                <div className="text-17 font-sharp-sans-bold text-neutral-1 mt-2 truncate line-clamp-2">
                  Logo Specifications
                </div>
                <div className="text-14 font-sharp-sans text-neutral-2">
                  It is preferred you upload a transparent dark logo on light
                  background, or a transparent white logo on dark background.{" "}
                  <br />
                  Image formats allowed are PNG and JPG. <br /> JGP is only
                  recommended if you have black or white background, or a
                  transparent white logo on dark background.
                </div>
                <div>
                  <div className="text-17 font-sharp-sans-bold text-neutral-1 mt-2 truncate line-clamp-2">
                    Size
                  </div>
                  <div className="text-14 font-sharp-sans text-neutral-2">
                    Min - 200px width x 100px height <br /> Max - 500px width x
                    250px height <br />
                    <br /> *Your company logo will display on preview after
                    changes have been saved.
                  </div>
                </div>
              </div>
            </div>
            {/* State Licenses  */}
            <div className="border border-solid border-alice-blue box-border rounded-3xl p-8 w-full mt-10">
              <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                Add Your Company State Licenses
              </div>

              <div className="text-14 font-sharp-sans text-neutral-2">
                If some states do not require a company state license, enter
                your company NMLS Number instead to enable that state. Note that
                loan officers can only create listings in these states after
                they also add their own state licenses. <br />
                <br />
                For some states, we will ask additional information that you
                will need to complete
              </div>

              <div className="mt-[30px]">
                <Form.List name="stateLicence">
                  {() => (
                    <div id="_stateLicence-wrapper_" className="w-full">
                      {selectedLicenseState.domElement.length > 0
                        ? selectedLicenseState.domElement.map(
                            ({ key, name }) => (
                              <div key={key} className="w-full">
                                <div className="flex flex-col lg:flex-row justify-center items-center gap-2">
                                  <div className="flex flex-col lg:flex-row  gap-4 w-full">
                                    <div
                                      className="flex-1"
                                      data-value=""
                                      id={`selection-${key}`}
                                    >
                                      <CustomFormItem
                                        label="License State"
                                        name={[name, "licenseState"]}
                                        required
                                        rules={config.requiredRule.slice(0, 1)}
                                      >
                                        {isAddCompany(loading) ? (
                                          <Skeleton.Input
                                            active
                                            size="default"
                                          />
                                        ) : (
                                          <CustomSelect
                                            placeholder="Select State"
                                            withsearch="true"
                                            statesearch="true"
                                            isClearable={false}
                                            options={state.filter(
                                              (item) => item.selected != true
                                            )}
                                            onChange={(opt) => {
                                              defualtStateLicenseSelection(
                                                opt?.value,
                                                `selection-${key}`
                                              );
                                            }}
                                            className="text-neutral-2 font-sharp-sans-medium"
                                          />
                                        )}
                                      </CustomFormItem>
                                    </div>
                                    <div className="flex-1">
                                      <CustomFormItem
                                        label="License Number"
                                        name={[name, "licenseNumber"]}
                                        required
                                        rules={config.requiredRule}
                                      >
                                        {isAddCompany(loading) ? (
                                          <Skeleton.Input
                                            active
                                            size="default"
                                          />
                                        ) : (
                                          <CustomInput
                                            type="text"
                                            placeholder="Enter License Number"
                                          />
                                        )}
                                      </CustomFormItem>
                                    </div>
                                  </div>
                                  {selectedLicenseState.domElement.length ===
                                  1 ? null : (
                                    <Button
                                      className="flex justify-between justify-items-center items-center bg-white text-neutral-1 font-sharp-sans-semibold gap-1 border border-solid border-error mb-2 md:mb-4 md:mt-0 lg:mt-3 w-full md:w-auto"
                                      onClick={() => {
                                        remove(
                                          name,
                                          selectedLicenseState.dynamicSelection,
                                          `selection-${key}`
                                        );
                                        // setIsTouch(true);
                                        onPropagation(true, false, "");
                                      }}
                                    >
                                      <img
                                        src={`${window.location.origin}/icon/removeIcon.png`}
                                        alt="add"
                                        style={{
                                          width: "12px",
                                          height: "12px",
                                        }}
                                      />{" "}
                                      <span className="text-error text-right">
                                        Remove
                                      </span>
                                    </Button>
                                  )}
                                </div>

                                <div id="_container-validation_">
                                  {selectedLicenseState.dynamicSelection
                                    .length > 0
                                    ? selectedLicenseState.dynamicSelection.map(
                                        (list) =>
                                          list.id == `selection-${key}`
                                            ? state
                                                .filter(
                                                  (item) =>
                                                    item.value == list.name
                                                )
                                                .map((item) =>
                                                  item.metadata
                                                    ? item.metadata.validation.map(
                                                        (v, vIndex) => (
                                                          <div key={vIndex}>
                                                            {v.name ==
                                                            "Branch Address" ? (
                                                              <div className="flex  flex-col lg:flex-row gap-4 w-full">
                                                                {v.selection.map(
                                                                  (
                                                                    ad,
                                                                    adindex
                                                                  ) => (
                                                                    <div
                                                                      key={
                                                                        adindex
                                                                      }
                                                                      style={{
                                                                        flex:
                                                                          ad.full_title ===
                                                                          "Address"
                                                                            ? "2.5"
                                                                            : "1",
                                                                      }}
                                                                      className="numeric_number"
                                                                    >
                                                                      <CustomFormItem
                                                                        label={`${
                                                                          ad.full_title ===
                                                                          "Address"
                                                                            ? `Branch ${ad.full_title}`
                                                                            : ad.full_title
                                                                        }`}
                                                                        name={[
                                                                          name,
                                                                          `${ad.full_title}`,
                                                                        ]}
                                                                        required
                                                                        rules={
                                                                          config.requiredRule
                                                                        }
                                                                      >
                                                                        <CustomInput
                                                                          type={
                                                                            ad.full_title ===
                                                                            "Zip"
                                                                              ? "number"
                                                                              : "text"
                                                                          }
                                                                          onChange={(
                                                                            e
                                                                          ) => {
                                                                            dispatch(
                                                                              {
                                                                                type: STATES.ON_INPUT_CHANGE,
                                                                                payload:
                                                                                  {
                                                                                    key: item.key,
                                                                                    add: ad.full_title,
                                                                                    value:
                                                                                      e
                                                                                        .target
                                                                                        .value,
                                                                                    name: v.name,
                                                                                  },
                                                                              }
                                                                            );
                                                                          }}
                                                                        />
                                                                      </CustomFormItem>
                                                                    </div>
                                                                  )
                                                                )}
                                                              </div>
                                                            ) : (
                                                              <div id="check-box">
                                                                {item.value.replace(
                                                                  /^[A-Z]{2}\s-\s/,
                                                                  ""
                                                                ) ===
                                                                "California" ? (
                                                                  <CustomFormItem
                                                                    label={
                                                                      v.name
                                                                    }
                                                                    name={[
                                                                      name,
                                                                      `${v.name}`,
                                                                    ]}
                                                                    required
                                                                    rules={
                                                                      config.requiredRule
                                                                    }
                                                                  >
                                                                    <div>
                                                                      {v.selection.map(
                                                                        (
                                                                          s,
                                                                          index
                                                                        ) => (
                                                                          <div
                                                                            key={
                                                                              index
                                                                            }
                                                                            className={`input-check-box ${
                                                                              props.hasOwnProperty(
                                                                                "viewDetails"
                                                                              ) &&
                                                                              "view-only"
                                                                            } flex flex-col lg:flex-row justify-start items-center`}
                                                                          >
                                                                            <Checkbox
                                                                              className="font-sharp-sans-medium text-neutral-2"
                                                                              checked={
                                                                                s.checked
                                                                              }
                                                                              onChange={(
                                                                                event
                                                                              ) => {
                                                                                onCheckChange(
                                                                                  event,
                                                                                  s.value,
                                                                                  "cxxxxx",
                                                                                  item.key,
                                                                                  v.name
                                                                                );
                                                                              }}
                                                                              disabled={props.hasOwnProperty(
                                                                                "viewDetails"
                                                                              )}
                                                                            >
                                                                              {
                                                                                s.full_title
                                                                              }
                                                                            </Checkbox>
                                                                          </div>
                                                                        )
                                                                      )}
                                                                    </div>
                                                                  </CustomFormItem>
                                                                ) : (
                                                                  <CustomFormItem
                                                                    label={
                                                                      v.name
                                                                    }
                                                                    name={[
                                                                      name,
                                                                      `${v.name}`,
                                                                    ]}
                                                                    required
                                                                    rules={
                                                                      config.requiredRule
                                                                    }
                                                                  >
                                                                    <div id="metaData-radio-xxx">
                                                                      {v.selection.map(
                                                                        (
                                                                          s,
                                                                          sIIndex
                                                                        ) => (
                                                                          <div
                                                                            key={
                                                                              sIIndex
                                                                            }
                                                                            className={`input-radio ${
                                                                              props.hasOwnProperty(
                                                                                "viewDetails"
                                                                              ) &&
                                                                              "view-only"
                                                                            } flex items-center justify-center gap-2 mr-2`}
                                                                          >
                                                                            <Radio.Group
                                                                              value={
                                                                                s.checked
                                                                                  ? s.value
                                                                                  : ""
                                                                              }
                                                                              disabled={props.hasOwnProperty(
                                                                                "viewDetails"
                                                                              )}
                                                                            >
                                                                              <Radio
                                                                                value={
                                                                                  s.value
                                                                                }
                                                                                onChange={(
                                                                                  event
                                                                                ) => {
                                                                                  onCheckChange(
                                                                                    event,
                                                                                    s.value,
                                                                                    `radioxxx-${sIIndex}-${item.metadata.name}-${s.full_title}`,
                                                                                    item.key,
                                                                                    v.name
                                                                                  );
                                                                                }}
                                                                              >
                                                                                <span
                                                                                  className={`${
                                                                                    props.hasOwnProperty(
                                                                                      "viewDetails"
                                                                                    ) &&
                                                                                    "text-gray-3"
                                                                                  }`}
                                                                                >
                                                                                  {
                                                                                    s.full_title
                                                                                  }
                                                                                </span>
                                                                              </Radio>
                                                                            </Radio.Group>
                                                                          </div>
                                                                        )
                                                                      )}
                                                                    </div>
                                                                  </CustomFormItem>
                                                                )}
                                                              </div>
                                                            )}
                                                          </div>
                                                        )
                                                      )
                                                    : null
                                                )
                                            : null
                                      )
                                    : null}
                                </div>
                              </div>
                            )
                          )
                        : null}
                    </div>
                  )}
                </Form.List>
                <Button
                  className="flex justify-between justify-items-center items-center bg-white text-neutral-1 font-sharp-sans-semibold border-xanth gap-1 w-full md:w-52 mt-4 md:mt-0 pb-1 pt-1.5"
                  onClick={() => {
                    addDom();
                    // setIsTouch(true);
                    onPropagation(true, false, "");
                  }}
                >
                  <img
                    src={`${window.location.origin}/icon/addIcon.png`}
                    alt="add"
                    style={{
                      marginTop: "-3px",
                      width: "12px",
                      height: "12px",
                    }}
                  />{" "}
                  <span>Add State License</span>
                </Button>
              </div>
            </div>
            {/* Additional Details */}
            <div className="border border-solid border-alice-blue box-border rounded-3xl p-8 w-full mt-8">
              <div className="text-denim text-2xl font-sharp-sans-bold pb-8 truncate line-clamp-2">
                Additional Details
              </div>

              <div
                style={{
                  paddingBottom: "5.6px",
                }}
              >
                Additional Listing Disclaimer (These are only included in the
                disclaimers section on the listing web page)
              </div>

              <div className="comp-text-area">
                <CustomFormItem name="additional_details">
                  {isAddCompany(loading) ? (
                    <Skeleton.Input active size="default" />
                  ) : (
                    <TextArea
                      placeholder="Additional Details"
                      maxLength={500}
                      onChange={(e) =>
                        setTimeout(
                          () =>
                            setTotalAdditionalDetails(e.target.value.length),
                          0
                        )
                      }
                      style={{
                        width: "100%",
                        height: "160px",
                      }}
                    />
                  )}
                </CustomFormItem>
                <div className="text-neutral-3">
                  {characterCount} of 500 max words
                </div>
                <div className="text-neutral-3">
                  Listing Disclaimer in addition to state defaults
                </div>
              </div>
            </div>
            <div
              className={`flex flex-col md:flex-row-reverse ${
                props.hasOwnProperty("onboarding")
                  ? "justify-center mb-5"
                  : "mb-16"
              } items-center gap-4  mt-8 md:mt-12  w-full`}
            >
              {!props.hasOwnProperty("viewDetails") && (
                <>
                  <CustomButton
                    {...appendFullWidth}
                    htmlType="submit"
                    disabled={onProgress || !selectedCompany || !isNMLSUnique}
                    ref={submitButton}
                    label={
                      onProgress ? (
                        <LoadingOutlined />
                      ) : isUpdate ? (
                        props.hasOwnProperty("onboarding") ? (
                          "Next"
                        ) : (
                          "Update"
                        )
                      ) : (
                        "Submit"
                      )
                    }
                  />
                  {Number(user?.user?.user_type_id) ===
                    userTypes.COMPANY_ADMIN && (
                    <CustomHollowButton
                      {...appendFullWidth}
                      onClick={() => {
                        if (props.hasOwnProperty("onboarding")) {
                          dispatch(backForwardToPage(1, props));
                        } else {
                          if (onProgress) return;

                          if (form.isFieldsTouched()) {
                            setIsModal(true);
                          } else {
                            window.history.back();
                          }

                          if (props.hasOwnProperty("viewDetails")) {
                            dispatch(getCompanyAction(company.id, true));
                            dispatch(getStatesAction());
                            dispatch(getPricingEngineAction());
                          }
                        }
                      }}
                      label={
                        props.hasOwnProperty("onboarding") ? "Back" : "Cancel"
                      }
                    />
                  )}
                  {/* Company admin cancel button */}
                  {Number(user?.user?.user_type_id) ===
                    userTypes.UPLIST_ADMIN && (
                    <CustomHollowButton
                      {...appendFullWidth}
                      onClick={() => {
                        if (onProgress) return;
                        if (isChange) {
                          onPropagation(true, true, "");
                        } else {
                          onDispatchBack();
                        }
                      }}
                      label={"Cancel"}
                    />
                  )}
                </>
              )}
            </div>
            {props.hasOwnProperty("onboarding") && (
              <>
                <div className="text-center my-3 text-neutral-3 font-sharp-sans-bold ">
                  {stepper.completeOnboarding ? (
                    <>
                      <LoadingOutlined />
                    </>
                  ) : (
                    <span
                      role="button"
                      className="cursor-pointer"
                      onClick={() => dispatch(backForwardToPage(3, props))}
                    >
                      Skip
                    </span>
                  )}
                </div>
                <div className="text-center mb-16 w-full text-neutral-3 font-sharp-sans">
                  2 of 4
                </div>
              </>
            )}
          </Form>
        </div>
        <PubListingMobilePreview
          theme={theme}
          headerBgColor={headerBackgroungColor}
        />
      </div>

      <ConfirmProgressModal
        isShowModal={isModalOpen}
        isLoading={onProgress}
        handleCancel={() => onPropagation(true, false, "")}
        handleBack={() => {
          onPropagation(false, false);
          onDispatchBack();
          formChangeRemove();
        }}
      />
    </div>
  );
};

export default AddUpdateCompany;
