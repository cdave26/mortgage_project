import React from "react";
import { Button, Checkbox, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { publishable } from "~/utils/listing";

const ListingConfirmUpdateComponent = (props) => {
  const {
    open,
    onCancel,
    onSubmit,
    disabled = false,
    isLoading,
    selectedStatus = "",
    setIsCheckedStatus,
    isCheckedStatus,
    source,
  } = props;

  return (
    <Modal
      closable={false}
      open={open}
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
              src={`${window.location.origin}/icon/warningIcon.png`}
              alt="icon"
            />
          </div>
          <div className="pl-8 relative">
            <div className="text-neutral-1 font-sharp-sans-bold text-xl">
              You are about to update this listing
            </div>
            {selectedStatus === "archived" && (
              <div className="text-neutral-2 text-sm font-sharp-sans-medium mt-1 mb-4">
                Flyers associated with this listing will be automatically
                archived.
              </div>
            )}
            <div className="text-neutral-2 text-sm font-sharp-sans-medium mt-1">
              Click update to proceed
            </div>
            {source === "list" && publishable.includes(selectedStatus) && (
              <div className="mt-2">
                <Checkbox
                  onChange={setIsCheckedStatus}
                  className="font-sharp-sans-medium text-neutral-2"
                  checked={isCheckedStatus}
                >
                  I have verified this property is eligible for financing
                </Checkbox>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end items center" style={{ gap: "10px" }}>
        <Button
          className="border border-solid border-xanth rounded-md text-sm font-sharp-sans-semibold"
          style={{ color: "rgba(0, 0, 0, 0.85)" }}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={disabled}
          style={{ maxWidth: "73px" }}
          className="bg-xanth text-neutral-1 border-xanth font-sharp-sans-semibold text-sm w-full px-2"
        >
          {isLoading ? <LoadingOutlined /> : "Update"}
        </Button>
      </div>
    </Modal>
  );
};

export default ListingConfirmUpdateComponent;
