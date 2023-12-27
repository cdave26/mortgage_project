import React, { useEffect, useState, useRef } from "react";
import { Form } from "antd";
import CustomDivider from "../base/CustomDivider";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import { LoadingOutlined } from "@ant-design/icons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  checkEmailIsExistAction,
  createUserAction,
  updateUserAction,
} from "~/store/users/action";
import { onHandleError } from "~/error/onHandleError";
import config from "~/config";
import { useRouter } from "next/router";
import { autoCrop } from "~/plugins/autoCropt";
import { onMobileNumber } from "~/lib/events";
import BackButton from "../base/buttons/BackButton";
import {
  backForwardToPage,
  draftsFrom,
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  getDraftsFrom,
  getDraftsFromByKey,
  removeDraftsFrom,
} from "~/store/ui/action";
import CustomHollowButton from "../base/buttons/CustomHollowButton";
import CustomButton from "../base/CustomButton";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import checkMobileScreen from "~/plugins/checkMobileScreen";
import { validateMobileNumber } from "~/plugins/mobileNumber";
import CustomSelect from "../base/CustomSelect";
import userTypeEnum from "~/enums/userTypes";
import { userTypeConstants } from "~/utils/constants";

let timeout = setTimeout(function () {}, 0);
const AddUserComponent = (props) => {
  const {
    loadingPrice,
    price,
    loadingUserTypes,
    userTypes,
    loadingCompany,
    company,
  } = useSelector((state) => {
    return {
      loadingPrice: state.pricingEngine.pricing.loading,
      price: state.pricingEngine.pricing.data,
      loadingUserTypes: state.auth.userTypes.loading,
      userTypes: state.auth.userTypes.data,
      loadingCompany: state.company.companyList.loading,
      company: state.company.companyList.company,
    };
  }, shallowEqual);

  const { updateUser } = useSelector((state) => state.users, shallowEqual);

  const {
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const router = useRouter();

  const selectImageRef = useRef(null);
  const selectCustomLogo = useRef(null);

  const submitButton = useRef(null);

  const [isEmailExist, setIsEmaiExist] = useState(false);
  const [onRequest, setOnRequest] = useState(false);
  const [onTyping, setOnTyping] = useState(false);
  const [profilePreview, setProfilePreview] = useState({
    file: null,
    preview: null,
    onProcess: false,
  });

  const [customLogoForLO, setCustomLogoForLO] = useState({
    file: null,
    preview: null,
    onProcess: false,
  });
  const [showMarketingFlyer, setShowMarketingFlyer] = useState(true);
  const { user } = useSelector((state) => {
    return {
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const { stepper } = useSelector((state) => {
    return {
      stepper: state.ui.stepper,
    };
  }, shallowEqual);

  const [isModal, setIsModal] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const [form] = Form.useForm();
  const appendFullWidth = checkMobileScreen() ? { isfullwidth: true } : {};

  useEffect(() => {
    const runDrafts = () => {
      if (getDraftsFrom("users").length > 0) {
        for (const key in getDraftsFrom("users")) {
          const draftData = getDraftsFrom("users")[key];
          if (draftData["isDraftRetrieve"]) {
            if (draftData["data"].length > 0) {
              for (const data of draftData["data"]) {
                form.setFields([
                  {
                    name: data.name,
                    value: data.value,
                  },
                ]);
              }
            }
          }
        }
      }
    };

    if (updateUser.isEdit) {
      if (!updateUser.loading) {
        if (Object.keys(updateUser.user).length > 0) {
          const formatted = {
            ...updateUser.user,
            company_id: {
              label: updateUser.user.company.name,
              value: updateUser.user.company.id,
            },
            pricing_engine_id: {
              label: updateUser.user.pricing_engine.name,
              value: updateUser.user.pricing_engine.id,
            },
            user_type_id: {
              label: userTypeConstants[updateUser.user.user_type.name],
              value: updateUser.user.user_type.id,
            },
          };

          for (const key in formatted) {
            if (
              user.user_type.id === userTypeEnum.COMPANY_ADMIN &&
              key === "user_type_id" &&
              formatted[key]["value"] === userTypeEnum.UPLIST_ADMIN
            ) {
              formatted[key] = {
                label: userTypeConstants[updateUser.user.user_type.name],
                value: updateUser.user.user_type.id,
              };
            }

            form.setFields([
              {
                name: `${key}`,
                value: formatted[key],
              },
            ]);
          }

          setProfilePreview({
            ...profilePreview,
            preview: updateUser.user.profile_logo,
          });

          if (
            Number(updateUser.user.user_type_id) ===
              userTypeEnum.LOAN_OFFICER &&
            updateUser.user.company.allow_loan_officer_to_upload_logo === 1
          ) {
            setCustomLogoForLO({
              ...customLogoForLO,
              preview: updateUser.user.custom_logo_flyers
                ? `${config.storagePath}${updateUser.user.custom_logo_flyers}`
                : updateUser.user.custom_logo_flyers,
            });
          }

          /**
           * back and forward button for browser
           * to retrieve the form data
           */

          // runDrafts();
        }
      }
    } else {
      //set default pricing engine
      if (user) {
        form.setFields([
          {
            name: "pricing_engine_id",
            value: {
              label: user.pricing_engine.name,
              value: user.pricing_engine.id,
            },
          },
        ]);

        if (Number(user.user_type_id) == 2) {
          form.setFields([
            {
              label: "Company",
              name: "company_id",
              value: {
                label: user.company.name,
                value: user.company.id,
              },
            },
          ]);
        }

        /**
         * back and forward button for browser
         * to retrieve the form data
         */

        // runDrafts();
      }
    }
  }, [updateUser, loadingPrice]);

  /**
   *Handle the change of the email input
   * @param {SyntheticBaseEvent} e
   * @returns {void}
   */

  const handleToCheckIfEmailIsExist = (e) => {
    clearTimeout(timeout);
    setOnTyping(true);
    setCheckEmail(true);
    timeout = setTimeout(() => {
      setCheckEmail(true);
      setOnTyping(false);
      if (e.target.value) {
        if (updateUser.isEdit) {
          if (
            e.target.value.trim().toLowerCase() ===
            updateUser.user.email.trim().toLowerCase()
          ) {
            setCheckEmail(false);
            return;
          }

          onValidateEmail(e.target.value);
        } else {
          onValidateEmail(e.target.value);
        }
      }
    }, 1000);
  };
  /**
   * Validate if the email is exist
   * @param {String} email
   */
  const onValidateEmail = async (email) => {
    const controller = new AbortController();
    const { signal } = controller;
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        const response = await checkEmailIsExistAction(email, signal);
        if (response.status === 200) {
          const { isExisted, message } = response.data;
          setIsEmaiExist(isExisted);
          if (isExisted) {
            setCheckEmail(true);
            // snackBar("Warning", "Email address already exist.", "error");
            form.setFields([
              {
                label: "Email Address",
                name: "email",
                errors: [message],
              },
            ]);
            form.scrollToField("email");
          } else {
            setCheckEmail(false);
          }
        }
      }
    } catch (error) {
      onHandleError(error, dispatch);
      setCheckEmail(false);
    } finally {
      controller.abort();
    }
  };

  const handleChange = (value) => {
    /**
     * Applicable for the uplist admin
     * auto papulate the pricing engine when the company is selected based on the company pricing engine
     */

    if (Number(user.user_type_id) === userTypeEnum.UPLIST_ADMIN) {
      const selectedCompany = company.find(
        (item) => item.value === Number(value)
      );
      if (selectedCompany) {
        form.setFields([
          {
            name: "pricing_engine_id",
            value: selectedCompany.pricing_engine,
          },
        ]);
      }
    }
  };

  const createUser = async (from) => {
    /**
     * trim the value of the email and alternative email
     */
    for (const key in from) {
      if (key === "job_title") {
        if (from[key] === undefined) {
          from[key] = "";
        }
      }
      if (key === "mobile_number") {
        if (from[key] === undefined) {
          from[key] = "";
        }
      }
      if (key === "alternative_email") {
        if (from[key] === undefined) {
          from[key] = null;
        }
      }
      if (key === "email") {
        if (from[key] === undefined || from[key] === null) {
          from[key] = "";
        }
      }
    }

    if (isEmailExist) {
      snackBar("The email address already exists.", "", "error");
    }

    const controller = new AbortController();
    const { signal } = controller;
    try {
      setOnRequest(true);
      from = {
        ...from,
        company_id: from.company_id.value,
        pricing_engine_id: from.pricing_engine_id.value,
        user_type_id: from.user_type_id.value,
      };

      if (profilePreview.file) {
        from = {
          ...from,
          profile_logo: profilePreview.file,
        };
      }

      const response = await dispatch(createUserAction(from, signal));
      if (response.status === 200) {
        snackBar(response.data.message, "", "success");
        form.resetFields();
        setOnRequest(false);

        form.setFields([
          {
            name: "pricing_engine_id",
            value: {
              label: user.pricing_engine.name,
              value: user.pricing_engine.id,
            },
          },
        ]);

        if (user.user_type_id == 2) {
          form.setFields([
            {
              label: "Company",
              name: "company_id",
              value: {
                label: user.company.name,
                value: user.company.id,
              },
            },
          ]);
        }

        onPropagation(false, false, "");
        formChangeRemove();
        // removeDraftsFrom("users");
        setTimeout(() => {
          router.push("/users");
          setProfilePreview({
            ...profilePreview,
            onProcess: false,
            file: null,
            preview: null,
          });
        }, 1000);
      }
    } catch (error) {
      onPropagation(false, false, "");
      formChangeRemove();
      if (error.response) {
        if (error.response.hasOwnProperty("data")) {
          if (error.response.data.hasOwnProperty("errors")) {
            const { errors } = error.response.data;
            const scrollToTheFirstError = Object.keys(errors)[0];
            for (const key in errors) {
              form.setFields([
                {
                  name: key,
                  errors: [errors[key]],
                },
              ]);
            }
            form.scrollToField(scrollToTheFirstError);
            return;
          }
        }
      }

      onHandleError(error, dispatch);
    } finally {
      controller.abort();
      setOnRequest(false);
    }
  };

  const updateUserDetails = (fromData) => {
    dispatch(
      updateUserAction(
        {
          ...fromData,
          company_id: fromData.company_id.value,
          pricing_engine_id: fromData.pricing_engine_id.value,
          user_type_id: fromData.user_type_id.value,
          id: updateUser.user.id,
          profile_logo: profilePreview.file
            ? profilePreview.file
            : profilePreview.preview,
          custom_logo_flyers: customLogoForLO.file,
        },
        false,
        form
      )
    );
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

  const onClickUploadImage = () => selectImageRef?.current.click();

  const onFileChange = (e) => {
    const [file] = e.target.files || e.dataTransfer.files;

    if (file) {
      const img = new Image();
      const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

      if (!allowedImageTypes.includes(file.type)) {
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: "Not a valid image file",
            description: "Please upload a valid image file. (jpg, jpeg, png)",
            position: "topRight",
            type: "error",
          },
        });
        if (e.type !== "drop") {
          e.target.value = "";
        }

        return;
      }

      img.src = window.URL.createObjectURL(file);
      img.onload = async () => {
        window.URL.revokeObjectURL(img.src);
        const fileSize = file.size;
        const maxSize = 0.75 * 1024 * 1024; // 0.75MB
        const minHeight = 250;
        // const maxHeight = 550;

        if (img.height < minHeight) {
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: "The image size is too small",
              description:
                "Image size should be - Height: Min. 250px / Max. 550px",
              position: "topRight",
              type: "error",
            },
          });
          if (e.type !== "drop") {
            e.target.value = "";
          }
          return;
        }

        if (fileSize > maxSize) {
          setProfilePreview({
            ...profilePreview,
            onProcess: true,
          });
          const result = await autoCrop(file, 500, 250);
          if (result) {
            imageIsReady(result, "profile");
          }
          if (e.type !== "drop") {
            e.target.value = "";
          }
          return;
        }

        imageIsReady(file, "profile");
        if (e.type !== "drop") {
          e.target.value = "";
        }
      };
    }
  };

  const onFileChangeCustomLogo = () => {
    const file = selectCustomLogo?.current.files[0];
    const img = new Image();
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];

    if (!allowedImageTypes.includes(file.type)) {
      dispatch({
        type: "UI/snackbars",
        payload: {
          open: true,
          message: "Not a valid image file",
          description: "Please upload a valid image file. (jpg, jpeg, png)",
          position: "topRight",
          type: "error",
        },
      });
      selectImageRef.current.value = "";
      return;
    }

    img.src = window.URL.createObjectURL(file);

    img.onload = async () => {
      window.URL.revokeObjectURL(img.src);
      const fileSize = file.size;
      const maxSize = 0.75 * 1024 * 1024; // 0.75MB
      const minHeight = 250;
      // const maxHeight = 550;

      // if (img.height < minHeight) {
      //   dispatch({
      //     type: "UI/snackbars",
      //     payload: {
      //       open: true,
      //       message: "Image is too small",
      //       description:
      //         "Image size should be - Height: Min. 250px / Max. 550px ",
      //       position: "topRight",
      //       type: "error",
      //     },
      //   });
      //   selectCustomLogo.current.value = "";
      //   return;
      // }

      if (fileSize > maxSize) {
        setCustomLogoForLO({
          ...customLogoForLO,
          onProcess: true,
        });
        const result = await autoCrop(file, 500, 250);
        if (result) {
          imageIsReady(result, "customLogo");
        }
        return;
      }

      imageIsReady(file, "customLogo");
    };
  };

  /**
   * Function to check if image is ready to upload
   * @param {File} file
   * @returns {void}
   */
  const imageIsReady = (file, pos) => {
    const reader = new FileReader();
    reader.onloadstart = readerProgress(pos);
    reader.onload = readerProgress(pos);
    reader.onprogress = readerProgress(pos);
    reader.onloadend = (e) => {
      setTimeout(() => {
        if (pos === "profile") {
          setProfilePreview({
            ...profilePreview,
            onProcess: false,
            file,
            preview: e.target.result,
          });
        }

        if (pos === "customLogo") {
          setCustomLogoForLO({
            ...customLogoForLO,
            onProcess: false,
            file,
            preview: e.target.result,
          });
        }
        onPropagation(true, false, "");
      }, 800);
    };

    reader.onerror = (e) => {
      if (pos === "profile") {
        setProfilePreview({
          ...profilePreview,
          onProcess: false,
          file: null,
          preview: null,
        });
      }

      if (pos === "customLogo") {
        setCustomLogoForLO({
          ...customLogoForLO,
          onProcess: false,
          file: null,
          preview: null,
        });
      }

      dispatch({
        type: "UI/snackbars",
        payload: {
          open: true,
          message: "Error",
          description:
            "There was an error while we read your image, please try again.",
          position: "topRight",
          type: "error",
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const readerProgress = (pos) => {
    if (pos === "profile") {
      setProfilePreview({
        ...profilePreview,
        onProcess: true,
      });
    }

    if (pos === "customLogo") {
      setCustomLogoForLO({
        ...customLogoForLO,
        onProcess: true,
      });
    }
  };

  const imageRender = (str, isUpdate, isFile) => {
    return (
      <img
        src={isUpdate ? (isFile ? str : `${config.storagePath}${str}`) : str}
        alt="profile-image"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "12px",
          objectFit: "cover",
          position: "relative",
          zIndex: "2",
        }}
      />
    );
  };

  const noImageRender = () => {
    return (
      <div
        className="flex flex-col justify-center justify-items-center items-center gap-2"
        style={{
          height: "198px",
        }}
      >
        <img
          src={`${window.location.origin}/icon/profile-icon.png`}
          alt="icon-profile"
          height={74}
          width={74}
        />

        <div
          style={{
            width: "100%",
            textAlign: "center",
          }}
        >
          Click to upload photo
        </div>
      </div>
    );
  };

  const onPropagation = (change, open, isURL) => {
    dispatch(formDialogAlert(change, open, isURL));
  };

  const getCustomLogo = () => {
    let logo = `${window.location.origin}/icon/marketingFlyerIcon.png`;

    if (updateUser.isEdit) {
      if (customLogoForLO.preview) {
        logo = customLogoForLO.preview;
      } else {
        if (updateUser.user.custom_logo_flyers) {
          logo = `${config.storagePath}${updateUser.user.custom_logo_flyers}`;
        }
      }
    } else {
      if (customLogoForLO.preview) {
        logo = customLogoForLO.preview;
      }
    }

    return logo;
  };

  const disableUserType = () => {
    if (!updateUser.isEdit) {
      return loadingUserTypes;
    }

    if (user.id === updateUser.user.id) {
      return true;
    }

    if (
      user.user_type.id === userTypeEnum.COMPANY_ADMIN &&
      [userTypeEnum.COMPANY_ADMIN, userTypeEnum.LOAN_OFFICER].includes(
        updateUser.user.user_type?.id
      )
    ) {
      return false;
    }

    return user.user_type?.id !== userTypeEnum.UPLIST_ADMIN;
  };

  const enableCustomLogo = () => {
    if (
      updateUser.user.user_type?.id === userTypeEnum.LOAN_OFFICER &&
      updateUser.user.company.allow_loan_officer_to_upload_logo
    ) {
      return true;
    }

    return false;
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
                window.history.back();
              }
            }}
          />
        </>
      )}

      <div className="my-0 mx-auto mt-10">
        {!props.hasOwnProperty("onboarding") && (
          <>
            <div className="flex justify-start items-start mb-3">
              <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
                {updateUser.isEdit ? "Update Profile" : "  Add a User"}
              </h2>
            </div>
            <CustomDivider />
          </>
        )}

        <div className="mt-10" id="_add-wrapper-user_">
          <Form
            layout="vertical"
            form={form}
            className="mt-5"
            onFinish={updateUser.isEdit ? updateUserDetails : createUser}
            disabled={
              loadingCompany ||
              loadingUserTypes ||
              loadingPrice ||
              updateUser.loading ||
              onRequest
            }
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

                    /**
                     * Save the drafts to local storage
                     */

                    // draftsFrom("users", value.name[0], value.value);
                  }
                  break;
                }
              }
            }}
          >
            <div id="_inputs-container_">
              <div className="flex flex-col lg:flex-row sm:content-center sm:items-center  mb-5 gap-6">
                <div
                  draggable={true}
                  onClick={onClickUploadImage}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (
                      event.currentTarget.classList.contains(
                        "-user-profile-image-"
                      )
                    ) {
                      event.currentTarget.classList.add("drop-over");
                    }
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.classList.remove("drop-over");
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.classList.remove("drop-over");
                    onFileChange(event);
                  }}
                  className="-user-profile-image-"
                >
                  {updateUser.isEdit
                    ? profilePreview.preview
                      ? imageRender(
                          profilePreview.preview,
                          updateUser.isEdit,
                          profilePreview.file
                        )
                      : noImageRender()
                    : profilePreview.preview
                    ? imageRender(
                        profilePreview.preview,
                        updateUser.isEdit,
                        profilePreview.file
                      )
                    : noImageRender()}

                  {profilePreview.preview && !profilePreview.onProcess && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        zIndex: "6",
                        right: "15px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "15px",
                        }}
                      >
                        <img
                          src={`${window.location.origin}/icon/deleteIconWhite.png`}
                          alt="trash-icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            setProfilePreview({
                              ...profilePreview,
                              preview: null,
                              file: null,
                            });
                            selectImageRef.current.value = "";
                          }}
                        />

                        <img
                          src={`${window.location.origin}/icon/upload-icon.png`}
                          alt="eye-icon"
                          onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            onClickUploadImage();
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className={`over-layer ${
                      profilePreview.onProcess ? "image-process" : ""
                    } `}
                  >
                    <div className="over-layer-text">Please wait...</div>
                  </div>
                  <input
                    ref={selectImageRef}
                    type="file"
                    name="user-profile"
                    id="user-profile"
                    style={{
                      width: "0",
                      height: "0",
                      position: "absolute",
                      zIndex: "1",
                    }}
                    accept="image/png, image/jpg, image/jpeg"
                    onChange={onFileChange}
                  />
                </div>
                <div className="flex flex-col justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-neutral-1 font-sharp-sans-bold text-base mb-3">
                      Picture Specifications
                    </div>
                    <div className="text-neutral-2 font-sharp-sans-medium ">
                      We recommend uploading a high-resolution picture with
                      contrasting colors that work well over a white background.
                       This picture will be used on flyers and listing pages.
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-neutral-1 font-sharp-sans-bold text-base mb-3">
                      Size:
                    </div>
                    <div className="text-neutral-2 font-sharp-sans-medium ">
                      Height: Min. 250px / Max. 550px <br />
                      Maximum Upload Size: 750KB
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center flex-col lg:flex-row gap-4 w-full">
                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="First Name"
                    name="first_name"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput
                      type="text"
                      placeholder="First Name"
                      maxLength="50"
                    />
                  </CustomFormItem>
                </div>
                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="Last Name"
                    name="last_name"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput
                      type="text"
                      placeholder="Last Name"
                      maxLength="50"
                    />
                  </CustomFormItem>
                </div>
              </div>

              <div className="flex justify-center items-center flex-col lg:flex-row gap-4 w-full">
                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="Company"
                    name="company_id"
                    required
                    rules={config.requiredRule.slice(0, 1)}
                  >
                    <CustomSelect
                      initialvalue="Select Company"
                      options={company}
                      onChange={(opt) => handleChange(opt?.value)}
                      className="text-neutral-2 font-sharp-sans-medium"
                      disabled={loadingCompany}
                      withsearch="true"
                      isClearable={false}
                    />
                  </CustomFormItem>
                </div>
                {enableCustomLogo() ? (
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Custom logo <span style='font-size: 11px;'>(Show this logo when you generate listings and flyers)</span>"
                      name="custom_logo"
                    >
                      <div className="flex flex gap-2 justify-start items-center">
                        <div
                          draggable={true}
                          onClick={() => selectCustomLogo?.current.click()}
                          className="-custom-logo- flex gap-2 justify-center items-center"
                          style={{ height: "40px" }}
                        >
                          <img
                            src={
                              customLogoForLO.preview || showMarketingFlyer
                                ? getCustomLogo()
                                : `${window.location.origin}/icon/marketingFlyerIcon.png`
                            }
                            alt="custom-logo"
                            style={{
                              borderRadius: "4px",
                              width: "auto",
                              objectFit: "contain",
                              height: "40px",
                              maxWidth: "150px",
                            }}
                            className={`cursor-pointer ${
                              customLogoForLO.preview || user.custom_logo_flyers
                                ? ""
                                : "border border-solid border-alice-blue box-border  p-1"
                            }`}
                            title="Click to upload custom logo"
                          />
                          <input
                            ref={selectCustomLogo}
                            type="file"
                            name="custom-logo"
                            id="custom-logo"
                            className="w-0 h-0 absolute z-1"
                            accept="image/png, image/jpg, image/jpeg"
                            onChange={onFileChangeCustomLogo}
                          />
                        </div>
                        {customLogoForLO.preview &&
                          !customLogoForLO.onProcess && (
                            <div>
                              <img
                                src={`${window.location.origin}/icon/deleteIconWhite.png`}
                                alt="trash-icon"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  event.preventDefault();
                                  setCustomLogoForLO({
                                    ...customLogoForLO,
                                    preview: null,
                                    file: null,
                                  });
                                  selectImageRef.current.value = "";
                                  setShowMarketingFlyer(false);
                                }}
                              />
                            </div>
                          )}
                      </div>
                    </CustomFormItem>
                  </div>
                ) : null}
              </div>

              <div className="flex justify-start items-center w-full gap-4 flex-col lg:flex-row">
                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="User Type"
                    name="user_type_id"
                    required
                    rules={config.requiredRule.slice(0, 1)}
                  >
                    <CustomSelect
                      initialvalue="Select User Type"
                      options={userTypes}
                      className="text-neutral-2 font-sharp-sans-medium"
                      disabled={disableUserType()}
                    />
                  </CustomFormItem>
                </div>
                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="Price Engine"
                    name="pricing_engine_id"
                    required
                    rules={config.requiredRule.slice(0, 1)}
                  >
                    <CustomSelect
                      placeholder="Select Price Engine"
                      options={price}
                      className="text-neutral-2 font-sharp-sans-medium"
                      disabled={loadingPrice}
                    />
                  </CustomFormItem>
                </div>
              </div>
              <div className="flex justify-center items-center gap-4 w-full flex-col lg:flex-row">
                <div className="flex-1  w-full">
                  <CustomFormItem label="Job Title" name="job_title">
                    <CustomInput
                      type="text"
                      placeholder="Job Title"
                      maxLength="50"
                    />
                  </CustomFormItem>
                </div>

                <div className="flex-1  w-full">
                  <CustomFormItem
                    label="NMLS Number"
                    name="nmls_num"
                    required
                    rules={config.requiredRule}
                  >
                    <CustomInput
                      type="text"
                      className="input-number"
                      placeholder="NMLS Number"
                      maxLength="50"
                    />
                  </CustomFormItem>
                </div>
              </div>
              <div className="flex justify-center items-center gap-4 w-full flex-col lg:flex-row">
                <div className="flex-1 w-full">
                  <CustomFormItem label="Mobile Number" name="mobile_number">
                    <CustomInput
                      type="text"
                      className="input-number"
                      placeholder="Mobile Number"
                      onKeyDown={onMobileNumber}
                      onChange={(event) => {
                        if (event.target.value) {
                          validateMobileNumber(
                            event.target.value,
                            form,
                            "mobile_number",
                            submitButton
                          );
                        } else {
                          if (submitButton.current) {
                            if (submitButton.current.disabled) {
                              submitButton.current.disabled = false;
                            }
                          }
                          setTimeout(() => {
                            form.setFields([
                              {
                                name: "mobile_number",
                                errors: [],
                              },
                            ]);
                          }, 0);
                        }
                      }}
                      maxLength="30"
                    />
                  </CustomFormItem>
                </div>

                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="Email Address"
                    name="email"
                    required
                    rules={config.requiredRule.concat({
                      type: "email",
                      message: "Invalid email.",
                    })}
                  >
                    <CustomInput
                      type="email"
                      onInput={handleToCheckIfEmailIsExist}
                      placeholder="Email Address"
                      maxLength="50"
                    />
                  </CustomFormItem>
                </div>
              </div>
              <div className="flex justify-start items-center w-full gap-4 flex-col lg:flex-row">
                <div className="flex-1 w-full">
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#CCD1D7",
                      fontFamily: "Sharp Sans",
                    }}
                  >
                    User URL Identifier
                  </div>
                  <CustomInput
                    type="text"
                    disabled={true}
                    placeholder={`${
                      updateUser.isEdit
                        ? updateUser.loading
                          ? "us10002"
                          : updateUser.user.url_identifier
                        : "us10002"
                    }`}
                  />
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#7E8C9C",
                      fontFamily: "Sharp Sans",
                    }}
                  >
                    htttps://uplist.co/base/listing/us1xxxxx-misxxxxx/
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <CustomFormItem
                    label="Alternate Email"
                    name="alternative_email"
                    rules={[
                      ...config.requiredRule.map((item) => ({
                        ...item,
                        required: false,
                        whitespace: false,
                      })),
                      ...[
                        {
                          type: "email",
                          message: "Invalid email.",
                        },
                      ],
                    ]}
                  >
                    <CustomInput
                      type="email"
                      placeholder="Alternate Email"
                      maxLength="50"
                    />
                  </CustomFormItem>
                </div>
              </div>
            </div>

            <div
              className={`flex flex-col md:flex-row-reverse ${
                props.hasOwnProperty("onboarding")
                  ? "justify-center pb-2"
                  : "pb-16"
              }  items-center gap-4 mt-6 w-full`}
            >
              <CustomButton
                {...appendFullWidth}
                htmlType="submit"
                disabled={checkEmail || onRequest || stepper.completeOnboarding}
                ref={submitButton}
                label={
                  updateUser.loading || onRequest ? (
                    <LoadingOutlined className="flex-1" />
                  ) : updateUser.isEdit ? (
                    props.hasOwnProperty("onboarding") ? (
                      "Next"
                    ) : (
                      "Update"
                    )
                  ) : (
                    "Add"
                  )
                }
              />
              <CustomHollowButton
                {...appendFullWidth}
                onClick={() => {
                  if (onRequest) return;

                  if (isChange) {
                    onPropagation(true, true, "");
                  } else {
                    if (url) {
                      router.push(url);
                    } else {
                      window.history.back();
                    }
                  }

                  // if (form.isFieldsTouched()) {
                  //   setIsModal(true);
                  // } else {
                  //   window.history.back();
                  // }
                }}
                disabled={props.hasOwnProperty("onboarding")}
                label={props.hasOwnProperty("onboarding") ? "Back" : "Cancel"}
              />
            </div>

            {props.hasOwnProperty("onboarding") && (
              <>
                <div className="text-center my-3 text-neutral-3 font-sharp-sans-bold ">
                  <span
                    role="button"
                    className="cursor-pointer"
                    onClick={() => dispatch(backForwardToPage(2, props))}
                  >
                    Skip
                  </span>
                </div>
                <div className="text-center pb-16 w-full text-neutral-3 font-sharp-sans">
                  1 of{" "}
                  {Number(props.onboarding.user_type_id) ===
                  userTypeEnum.LOAN_OFFICER
                    ? "2"
                    : "4"}
                </div>
              </>
            )}
          </Form>
        </div>
      </div>

      <ConfirmProgressModal
        isShowModal={isModalOpen}
        isLoading={onRequest}
        handleCancel={() => onPropagation(true, false, "")}
        handleBack={() => {
          onPropagation(false, false, "");
          if (url) {
            router.push(url);
          } else {
            window.history.back();
          }

          formChangeRemove();

          // removeDraftsFrom("users");
        }}
      />
    </div>
  );
};

export default AddUserComponent;
