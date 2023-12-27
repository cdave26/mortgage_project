import React from "react";
import { Button, Modal } from "antd";

import { changesMadeConstant, onProgressConstant } from "~/utils/changes-const";

const ConfirmProgressModal = (props) => {
  const { isShowModal, isLoading, handleCancel, handleBack } = props;

  return (
    <Modal
      closable={false}
      open={isShowModal}
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
              {isLoading ? onProgressConstant.title : changesMadeConstant.title}
            </div>
            <div className="text-neutral-2 text-sm font-sharp-sans-medium mt-1">
              {isLoading ? onProgressConstant.desc : changesMadeConstant.desc}
            </div>
          </div>
        </div>
      </div>
      {isLoading ? (
        <></>
      ) : (
        <div className="flex justify-end items center" style={{ gap: "10px" }}>
          <Button
            className="border border-solid border-xanth rounded-md text-sm font-sharp-sans-semibold pb-1 pt-1.5"
            style={{ color: "rgba(0, 0, 0, 0.85)" }}
            onClick={handleCancel}
          >
            Close
          </Button>
          <Button
            className="bg-error text-neutral-7 font-sharp-sans-semibold text-sm pb-1 pt-1.5 px-1.5"
            style={{ maxWidth: "100px" }}
            onClick={handleBack}
          >
            {"Don't Save"}
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default ConfirmProgressModal;
