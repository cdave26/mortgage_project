import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Col, Form, Pagination, Row } from "antd";

import { getLicensesPerStateAction } from "~/store/licenses/action";
import { FLYERS } from "~/store/flyers/type";
import { onHandleError } from "~/error/onHandleError";
import {
  downloadFlyerAction,
  generateFlyerWithColorsAction,
} from "~/store/flyers/action";
import { setSpinningAction } from "~/store/ui/action";

import CustomDivider from "../base/CustomDivider";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import CustomButton from "../base/CustomButton";
import DownloadModal from "../base/modal/DownloadModal";
import SectionFormContainer from "../base/SectionFormContainer";
import checkMobileScreen from "~/plugins/checkMobileScreen";
import CustomSelect from "../base/CustomSelect";

const GenerateMarketingFlyers = () => {
  const [firstRender, setFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState(null);
  const [flyersDownload, setFlyersDownload] = useState({
    open: false,
    progress: 0,
    onRequested: false,
  });

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const appendFullWidth = checkMobileScreen() ? { isfullwidth: true } : {};

  const { user: userData } = useSelector(
    (state) => state.auth.data,
    shallowEqual
  );

  const {
    flyersTemplates,
    companystates,
    loadingCompanyStates,
    licensesPerState,
    loadingLicensesPerState,
    loadingFlyersTemplates,
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      companystates: state.licenseStates.statesPerCompany.data,
      loadingCompanyStates: state.licenseStates.statesPerCompany.loading,
      licensesPerState: state.licenses.licensesPerState.data,
      loadingLicensesPerState: state.licenses.licensesPerState.loading,
      flyersTemplates: state.flyers.listOfFlyerTemplates.list,
      loadingFlyersTemplates: state.flyers.listOfFlyerTemplates.loading,
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

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

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (userData && Object.keys(userData).length) {
      const formatted = {
        ...userData,
        loan_officer: `${userData["first_name"]} ${userData["last_name"]}`,
        company_nmls_number: userData["company"]["company_nmls_number"],
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
  }, [userData]);

  // prevent snackbar from rendering on first load
  useEffect(() => {
    if (!firstRender && !loadingLicensesPerState) {
      if (licensesPerState.length) {
        form.setFields([
          { name: "license_id", value: licensesPerState[0].value },
        ]);
      } else {
        snackBar(
          "No license added for the selected State",
          "Please add a license in My State Licenses page.",
          "error"
        );
      }
    } else {
      setFirstRender(false);
    }
  }, [loadingLicensesPerState]);

  const downloadFile = (flyerId, signal) => {
    dispatch(
      downloadFlyerAction({
        fileName: flyerId,
        flyerId,
        flyersDownload,
        setFlyersDownload,
        signal,
      })
    );
  };

  const handleStateChange = (value) => {
    const filtered = companystates.find((state) => state.value === value);

    if (!filtered) {
      form.resetFields(["license_id"]);
      return;
    }

    setSelectedStateId(filtered.key);
    dispatch(getLicensesPerStateAction(filtered.key, userData.id));

    form.resetFields(["license_id"]);
  };

  const resetModal = () => {
    setSelectedImages([]);
    form.setFields([
      { name: "licensing_state", value: "" },
      { name: "license_id", value: "" },
    ]);
  };

  const handleCancelDownload = () => {
    if (flyersDownload.onRequested) return;

    setFlyersDownload({
      ...flyersDownload,
      open: false,
      progress: 0,
      onRequested: false,
    });
  };

  const handleSubmit = async (values) => {
    if (!selectedImages.length) {
      snackBar("Please select a flyer template.", "", "error");
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    dispatch(setSpinningAction(true));

    try {
      const selectedImage = selectedImages[0];
      const flyerId = selectedImage.id;
      const pdfflyerName = selectedImage.name;

      const response = await generateFlyerWithColorsAction(
        flyerId,
        pdfflyerName.toUpperCase(),
        signal,
        "marketing",
        null,
        null,
        selectedStateId
      );

      if (response.status === 200) {
        snackBar(response.data.message, "", "success");

        setFlyersDownload({
          ...flyersDownload,
          open: true,
        });

        downloadFile(response.data.url, signal);
        resetModal();
      }
    } catch (error) {
      onHandleError(error, dispatch);
      resetModal();
    } finally {
      controller.abort();
      dispatch(setSpinningAction(false));
    }
  };

  const handleImageClick = (image) => {
    setSelectedImages([image]);
  };

  const isImageSelected = (image) => {
    return selectedImages.includes(image);
  };

  const onChange = (page, pageSize) => {
    dispatch(
      getFlyerTemplatesAction({
        page: page,
        limit: pageSize,
        type: "listing",
      })
    );
  };

  const formPanelClassName =
    "listing-collapse-panel w-full text-2xl font-sharp-sans-bold bg-white border-alice-blue rounded-lg";

  return (
    <div className="pb-16">
      <Row className="flex md:justify-between flex-col md:flex-row items-start mb-3 gap-6">
        <div>
          <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl md:text-center">
            Select a Marketing Flyer
          </h2>
        </div>
      </Row>
      <CustomDivider />
      <div>
        <p className="font-sharp-sans text-neutral-2 text-body-2">
          Share marketing flyers to connect with your builder and agent
          partners.
        </p>
      </div>
      <div className="mt-7">
        <Form form={form} onFinish={handleSubmit}>
          <div>
            <div>
              <SectionFormContainer label="Loan Officer Details">
                <Col className="flex justify-center flex-col md:flex-row md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Officer"
                      name="loan_officer"
                      disabled
                    >
                      <CustomInput type="text" disabled />
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Officer Contact Email"
                      name="email"
                      disabled
                    >
                      <CustomInput type="text" disabled />
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Loan Officer Contact Number"
                      name="mobile_number"
                      disabled
                    >
                      <CustomInput type="text" disabled />
                    </CustomFormItem>
                  </div>
                </Col>
                <Col className="flex justify-center flex-col md:flex-row md:gap-4 w-full">
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Licensing State"
                      name="licensing_state"
                      disabled={loadingCompanyStates}
                    >
                      <CustomSelect
                        placeholder="Select State"
                        options={companystates}
                        loading={loadingCompanyStates}
                        onChange={(opt) => handleStateChange(opt?.value)}
                        disabled={loadingCompanyStates}
                        withsearch="true"
                        statesearch="true"
                      />
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="License Number"
                      name="license_id"
                      disabled
                    >
                      <CustomInput type="text" disabled />
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem label="MLS Number" name="nmls_num" disabled>
                      <CustomInput type="text" disabled />
                    </CustomFormItem>
                  </div>
                  <div className="flex-1 w-full">
                    <CustomFormItem
                      label="Company NMLS Number"
                      name="company_nmls_number"
                      disabled
                    >
                      <CustomInput type="text" disabled />
                    </CustomFormItem>
                  </div>
                </Col>
              </SectionFormContainer>
            </div>
            <div className="mt-5 w-full">
              <SectionFormContainer label="Select a Flyer Design">
                <Col className="flex w-full flex-col flex-row md:flex-col">
                  <Row className="w-full gap-2 flex w-full">
                    {isLoading ? (
                      <div className="w-full h-[150px] flex justify-center items-center">
                        <p className="font-sharp-sans text-neutral-2 text-body-2">
                          Loading templates
                        </p>
                      </div>
                    ) : (
                      (Object.keys(flyersTemplates).length
                        ? flyersTemplates.data
                        : []
                      ).map((flyer) => (
                        <Col key={flyer.id} className="text-center h-full">
                          <div
                            className={`max-w-[184px] max-h-[238px]flyer-image ${
                              isImageSelected(flyer) ? "selected-flyer" : ""
                            }`}
                            onClick={() => handleImageClick(flyer)}
                          >
                            <img
                              className="w-full h-full"
                              src={`${flyer.image}`}
                            />
                          </div>
                        </Col>
                      ))
                    )}
                  </Row>
                  <div className="text-right my-4">
                    <Pagination
                      current={
                        Object.keys(flyersTemplates).length
                          ? flyersTemplates.current_page
                          : 1
                      }
                      total={
                        Object.keys(flyersTemplates).length
                          ? flyersTemplates.total
                          : 0
                      }
                      defaultPageSize={FLYERS.FLYER_TEMPLATE_SIZE}
                      onChange={onChange}
                    />
                  </div>
                </Col>
              </SectionFormContainer>
            </div>
            <div className="flex justify-end mt-10 pb-8">
              <CustomButton
                {...appendFullWidth}
                label="Generate Flyer"
                type="primary"
                htmlType="submit"
              />
            </div>
          </div>
        </Form>
      </div>
      <DownloadModal
        name="flyers"
        open={flyersDownload.open}
        progress={flyersDownload.progress}
        onCancel={handleCancelDownload}
      />
    </div>
  );
};

export default GenerateMarketingFlyers;
