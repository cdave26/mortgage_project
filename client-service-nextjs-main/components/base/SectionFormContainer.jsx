import React from "react";
import { Row } from "antd";

const HeaderPanel = ({ label }) => {
  return (
    <div className="mb-4">
      <h5 className="text-header-5 my-0 font-sharp-sans-bold">{label}</h5>
    </div>
  );
};

const SectionFormContainer = ({ children, label }) => {
  let baseClassname =
    "w-full mb-[10px] border-x-0 border-t-0 border-b border-solid border-alice-blue ";
  return (
    <Row className={baseClassname}>
      <HeaderPanel label={label} />
      {children}
    </Row>
  );
};

export default SectionFormContainer;
