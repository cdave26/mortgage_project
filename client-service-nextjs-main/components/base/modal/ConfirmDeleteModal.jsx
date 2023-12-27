import React from "react";

import { LoadingOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";

/**
 * Confirm Delete Modal
 * @param {*} props
 */
const ConfirmDeleteModal = (props) => {
  const {
    title,
    subtitle,
    handleDelete,
    handleCancel,
    openModal,
    onProgress,
    buttonTitle,
  } = props;

  return (
    <Modal
      closable={false}
      open={openModal}
      className="confirmation"
      footer={null}
      centered
    >
      <div style={{ marginBottom: "25px", paddingBottom: "5px" }}>
        <div
          className="flex justify-start items-center relative"
          style={{ gap: "15px" }}
        >
          <div className="w-5 h-5 absolute top-1">
            <img
              className="relative w-full h-full"
              src={`${window.location.origin}/icon/questionMarkICon.png`}
              alt="icon"
            />
          </div>
          <div className="pl-8 relative">
            <div className="text-error font-sharp-sans-bold text-xl">
              {title}
            </div>
            <div className="text-neutral-2 text-sm font-sharp-sans-medium mt-1">
              {subtitle}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end items center" style={{ gap: "10px" }}>
        <Button
          className="border border-solid border-xanth rounded-md text-sm font-sharp-sans-semibold pb-1"
          style={{ color: "rgba(0, 0, 0, 0.85)" }}
          disabled={onProgress}
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button
          className="bg-error text-neutral-7 font-sharp-sans-semibold text-sm w-full pb-1 px-1.5"
          style={{ maxWidth: "73px" }}
          disabled={onProgress}
          onClick={handleDelete}
        >
          {onProgress ? (
            <LoadingOutlined />
          ) : buttonTitle ? (
            buttonTitle
          ) : (
            "Delete"
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
