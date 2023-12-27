import React, { useState } from "react";
import { Modal, Row, Col as AntdCol, Pagination, Spin } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { LoadingOutlined } from "@ant-design/icons";

import {
  generateFlyersAction,
  generateFlyerWithColorsAction,
  getFlyerTemplatesAction,
  handleListingFlyerModal,
  resetFlyerTemplatesAction,
} from "~/store/flyers/action";
import { FLYERS } from "~/store/flyers/type";
import { getListingGeneratedFlyerAction } from "~/store/listing/action";
import { onHandleError } from "~/error/onHandleError";

import CustomHollowButton from "../base/buttons/CustomHollowButton";
import CustomButton from "../base/CustomButton";
import CustomDivider from "../base/CustomDivider";

const FlyerModal = () => {
  const { pathname } = new URL(window.location.href);
  const listingId = pathname.split("/").pop();

  const [selectedImages, setSelectedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const dispatch = useDispatch();

  const {
    flyersTemplates,
    loadingFlyersTemplates,
    selectedListing,
    listingFlyersModal,
  } = useSelector((state) => {
    return {
      selectedListing: state.listings.updateListing.listing,
      listingFlyersModal: state.flyers.listingFlyersModal,
      flyersTemplates: state.flyers.listOfFlyerTemplates.list,
      loadingFlyersTemplates: state.flyers.listOfFlyerTemplates.loading,
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

  const resetModal = () => {
    setSelectedImages([]);
    setIsGenerating(false);
    resetFlyerTemplatesAction(dispatch);
    dispatch(handleListingFlyerModal(false));
  };

  const handleOk = async () => {
    if (!selectedImages.length) {
      snackBar("Please select flyers template.", "", "error");
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    setIsGenerating(true);

    try {
      const selectedImage = selectedImages[0];
      const flyerId = selectedImage.id;
      const pdfflyerName = selectedImage.name;

      let response;

      const manualGenerateFlyers = [
        "CASUAL",
        "COMPANY_THEME",
        "UNDERSTATED",
        "ELEGANT_GOLD",
        "ELEGANT_SILVER",
        "BOLD_BLUE",
        "BOLD_YELLOW",
        "THROWBACK_BLUE",
        "THROWBACK_YELLOW",
        "TECH_GREEN",
      ];

      if (manualGenerateFlyers.includes(pdfflyerName.toUpperCase())) {
        response = await generateFlyerWithColorsAction(
          flyerId,
          pdfflyerName.toUpperCase(),
          signal,
          "listing",
          selectedListing.page_link,
          listingId,
          selectedListing.state_id
        );
      } else {
        response = await generateFlyersAction(
          selectedImage.pdfUrl,
          flyerId,
          selectedListing.page_link,
          listingId,
          signal
        );
      }

      if (response && response.status === 200) {
        snackBar(response.data.message, "", "success");

        dispatch(getListingGeneratedFlyerAction({ listingId }));

        setTimeout(() => {
          resetModal();
        }, 1500);
      } else {
        onHandleError(error, dispatch);
        resetModal();
      }
    } catch (error) {
      onHandleError(error, dispatch);
      resetModal();
    } finally {
      controller.abort();
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

  return (
    <Modal
      title=""
      open={listingFlyersModal}
      closeIcon={<></>}
      width={1048}
      className="modal-form font-sharp-sans-bold"
      destroyOnClose
      footer={null}
    >
      <Spin
        spinning={isGenerating || loadingFlyersTemplates}
        className="max-h-screen"
        indicator={
          <LoadingOutlined
            className="items-center justify-center text-denim text-5xl"
            spin
          />
        }
      >
        <h2 className="text-denim text-denim font-sharp-sans-bold text-3xl mt-0 mb-4">
          Select a Flyer Design
        </h2>
        <CustomDivider />
        <Row className="w-full gap-3 flex justify-center md:justify-between mt-8">
          {(Object.keys(flyersTemplates).length
            ? flyersTemplates.data
            : []
          ).map((flyer) => (
            <AntdCol span={4.5} key={flyer.id} className="text-center h-full">
              <div
                className={`max-w-[184px] max-h-[238px] flyer-image ${
                  isImageSelected(flyer) ? "selected-flyer" : ""
                }`}
                onClick={() => handleImageClick(flyer)}
              >
                <img className="w-full h-full" src={`${flyer.image}`} />
              </div>

              <div className="font-sharp-sans-medium text-neutral-3 mb-2 pt-2">
                {`${flyer.name
                  .split("_")
                  .map((word) => word.toUpperCase())
                  .join(" (")}${flyer.name.split("_").length > 1 ? ")" : ""}`}
              </div>
            </AntdCol>
          ))}
        </Row>
        <div className="text-right my-10">
          <Pagination
            current={
              Object.keys(flyersTemplates).length
                ? flyersTemplates.current_page
                : 1
            }
            total={
              Object.keys(flyersTemplates).length ? flyersTemplates.total : 0
            }
            defaultPageSize={FLYERS.FLYER_TEMPLATE_SIZE}
            onChange={onChange}
            disabled={isGenerating}
          />
        </div>
        <div className="flex justify-end mt-10">
          <div className="flex gap-5">
            <CustomHollowButton
              disabled={isGenerating}
              onClick={resetModal}
              label="Cancel"
            />
            <CustomButton
              label="Create Flyer"
              key="generate"
              type="primary"
              disabled={isGenerating}
              onClick={handleOk}
            />
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default FlyerModal;
