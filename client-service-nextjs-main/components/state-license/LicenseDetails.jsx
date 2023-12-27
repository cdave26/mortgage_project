import React, { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Col, Row, Skeleton } from "antd";
import { useRouter } from "next/router";

import {
  deleteLicenseAction,
  isEditLicenseAction,
  selectedLicenseAction,
} from "~/store/licenses/action";

import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import BackButton from "../base/buttons/BackButton";
import ContentHeader from "../base/common/ContentHeader";

const LicenseDetails = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { license } = useSelector(
    (state) => state.licenses.updateLicense,
    shallowEqual
  );

  const [isDelete, setIsDelete] = useState({
    open: false,
    licenseToDelete: null,
    onProgress: false,
  });

  const { pathname } = new URL(window.location.href);
  const licenseId = pathname.split("/").pop();

  /**
   * Loading
   * @param {Object} loading
   * @returns {Boolean}
   */
  const onLoading = (loading) => !Object.keys(loading).length;

  /**
   * On delete license or cancel delete
   * @param {String} typeOfAction
   * @returns {void}
   */
  const footerOnAction = async (typeOfAction) => {
    if (typeOfAction === "cancel") {
      setIsDelete({
        open: false,
        licenseToDelete: null,
      });
    } else if (typeOfAction === "confirm") {
      setIsDelete({
        ...isDelete,
        onProgress: true,
      });
      const response = await dispatch(
        deleteLicenseAction(isDelete.licenseToDelete)
      );

      if (response) {
        setIsDelete({
          open: false,
          licenseToDelete: null,
          onProgress: false,
        });

        setTimeout(() => {
          window.location.href = "/my-state-licenses";
        }, 500);
      } else {
        setIsDelete({
          ...isDelete,
          onProgress: false,
        });
      }
    }
  };

  const onUpdateLicense = (e) => {
    e.preventDefault();
    dispatch(isEditLicenseAction(true));
    dispatch(selectedLicenseAction(license));
    router.push(`/my-state-licenses/edit/${licenseId}`);
  };

  const onDeleteLicense = () => {
    setIsDelete({
      open: true,
      licenseToDelete: licenseId,
    });
  };

  return (
    <Row>
      <Col sm={24} md={24} lg={24} className="mb-3">
        <BackButton handleBack={() => window.history.back()} />
      </Col>
      <Col sm={24} md={24} lg={24}>
        <ContentHeader
          title={"License Details"}
          hasUpdateBtn
          hasDeleteBtn
          updateBtnRoute={`/my-state-licenses/edit/${licenseId}`}
          updateBtnHandler={onUpdateLicense}
          deleteBtnHandler={onDeleteLicense}
        />
        <Row className="w-full h-full border border-solid border-alice-blue box-border mt-10 px-8 pt-8 rounded-3xl">
          <Row className="flex justify-start items-start w-full">
            <Col xs={24} lg={12} className="mb-8">
              <div className="font-sharp-sans-medium text-neutral-3 mb-2">
                ID
              </div>
              <div className="text-base font-sharp-sans-medium text-neutral-1">
                {onLoading(license) ? (
                  <Skeleton paragraph={{ rows: 0 }} />
                ) : (
                  license.id
                )}
              </div>
            </Col>
            <Col xs={24} lg={12} className="mb-8">
              <div className="font-sharp-sans-medium text-neutral-3 mb-2">
                State
              </div>
              <div className="text-base font-sharp-sans-medium text-neutral-1">
                {onLoading(license) ? (
                  <Skeleton paragraph={{ rows: 0 }} />
                ) : (
                  license.state
                )}
              </div>
            </Col>
          </Row>

          <Row className="flex justify-start items-start w-full">
            <Col xs={24} lg={12} className="mb-8">
              <div className="font-sharp-sans-medium text-neutral-3 mb-2">
                License
              </div>
              <div className="text-base font-sharp-sans-medium text-neutral-1">
                {onLoading(license) ? (
                  <Skeleton paragraph={{ rows: 0 }} />
                ) : (
                  license.license
                )}
              </div>
            </Col>
            <Col xs={24} lg={12} className="mb-8">
              <div className="font-sharp-sans-medium text-neutral-3 mb-2">
                Updated
              </div>
              <div className="text-base font-sharp-sans-medium text-neutral-1">
                {onLoading(license) ? (
                  <Skeleton paragraph={{ rows: 0 }} />
                ) : (
                  license.updated_at
                )}
              </div>
            </Col>
          </Row>
        </Row>
      </Col>

      <ConfirmDeleteModal
        title="You are about to delete a license"
        subtitle="Are you sure that you want to delete this license?"
        handleDelete={() => footerOnAction("confirm")}
        handleCancel={() => footerOnAction("cancel")}
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
      />
    </Row>
  );
};

export default LicenseDetails;
