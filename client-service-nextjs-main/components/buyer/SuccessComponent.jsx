import React from "react";
import { Button, Col, Row } from "antd";
import CustomDivider from "../base/CustomDivider";

const BuyerSuccess = () => {
  return (
    <Row justify={"center"} style={{ marginBottom: -32 }}>
      <Col xs={24} md={24} lg={24}>
        <div className="text-center">
          <h2 className="text-denim font-sharp-sans-bold text-6xl mb-4">
            Thank you!
          </h2>
          <Row justify={"center"} align={"middle"}>
            <CustomDivider />
          </Row>
          <Row justify={"center"} align={"middle"}>
            <p className="text-neutral-2 font-sharp-sans text-body-2 mb-10">
              Your pre-approval request has been sent.
            </p>
          </Row>
          <Row justify={"center"} align={"middle"}>
            <Button
              type="text"
              className={`font-sharp-sans-semibold bg-white border-xanth marker h-12 rounded-lg border-2 mb-14`}
              style={{ minWidth: 166 }}
              onClick={() => {
                window.location.href = "/buyer";
              }}
            >
              <a className="font-sharp-sans-semibold text-lg">Return to Home</a>
            </Button>
          </Row>
        </div>
      </Col>
    </Row>
  );
};
export default BuyerSuccess;
