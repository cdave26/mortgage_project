import React from "react";

import Modal from "~/components/modal/Modal";

const ProgressModal = (props) => {
  const { open, name } = props;

  return (
    <Modal
      open={open}
      closeIcon={<></>}
      destroyOnClose
      className="modal-progress"
    >
      <div>
        <div className="flex justify-start items-center gap-15 relative">
          <div className="w-12">
            <img
              className="absolute top-0"
              src={`${window.location.origin}/icon/questionMarkICon.png`}
              alt="icon"
            />
          </div>

          <div className="w-full">
            <div className="font-sharp-sans-semibold text-error text-base">
              Downloading {name}
            </div>
            <div className="font-sharp-sans text-neutral-2 text-sm mt-2">
              Please wait, getting your {name} ready.
            </div>
            <div className="font-sharp-sans text-neutral-2 text-sm mt-2">
              <div
                className="progress progress-striped active"
                style={{
                  width: "100%",
                }}
              >
                <div
                  role="progressbar progress-striped"
                  className="progress-bar"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProgressModal;
