import React from "react";
import { Modal, Row } from "antd";
import { shallowEqual, useSelector } from "react-redux";

import CustomButton from "~/components/base/CustomButton";
import CustomDivider from "~/components/base/CustomDivider";

const AgentListingSuccess = () => {
  const { showSuccessModal, successMessage } = useSelector(
    (state) => ({
      showSuccessModal:
        state?.publicStore?.publicAgentListing?.showSuccessModal,
      successMessage: state?.publicStore?.publicAgentListing?.successMessage,
    }),
    shallowEqual
  );

  const handleContinue = () => {
    location.reload();
  };

  return (
    <Modal
      centered
      open={showSuccessModal}
      footer={null}
      width={400}
      closable={false}
    >
      <Row className="flex justify-center w-full items-center">
        <div className="bg-white h-fit">
          <div>
            <div className="flex flex-col items-center">
              <Row className="mb-4">
                <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
                  {successMessage}
                </h2>
              </Row>
              <CustomDivider />
              <Row className="mt-4">
                <CustomButton label="OK" onClick={handleContinue} />
              </Row>
            </div>
          </div>
        </div>
      </Row>
    </Modal>
  );
};

export default AgentListingSuccess;
