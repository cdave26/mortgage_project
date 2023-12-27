import React from "react";
import { Col, Row, Grid } from "antd";
import ExportCSVButton from "../buttons/ExportCSVButton";
import AddLinkButton from "../buttons/AddLinkButton";
import CustomDivider from "../CustomDivider";
import UpdateButton from "../buttons/UpdateButton";
import DeleteButton from "../buttons/DeleteButton";

const ContentHeader = ({
  title,
  hasExportCSVBtn,
  hasAddBtn,
  hasUpdateBtn,
  hasDeleteBtn,
  addBtnLabel,
  addBtnRoute,
  updateBtnRoute,
  updateBtnHandler,
  deleteBtnHandler,
  CSVHandler,
  addBtnHandler,
  customDeleteBtn,
}) => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;
  const isAutoBtnWidth = [
    "My State License",
    "Company",
    "Listing Details",
  ].includes(title);
  const mobileHeaderStyle = isMobile
    ? "w-full"
    : isAutoBtnWidth
    ? "w-auto"
    : "w-48";

  const CSVBtn = (
    <Col {...(isMobile ? { xs: 24, sm: 24 } : {})}>
      <ExportCSVButton className={mobileHeaderStyle} onClick={CSVHandler} />
    </Col>
  );

  const addBtn = (
    <Col {...(isMobile ? { xs: 24, sm: 24 } : {})}>
      <AddLinkButton
        className={mobileHeaderStyle}
        label={addBtnLabel}
        href={addBtnRoute}
        {...(addBtnHandler ? { onClick: addBtnHandler } : {})}
      />
    </Col>
  );

  const updateBtn = (
    <Col {...(isMobile ? { xs: 24, sm: 24 } : {})}>
      <UpdateButton
        href={updateBtnRoute}
        {...(updateBtnHandler ? { onClick: updateBtnHandler } : {})}
      />
    </Col>
  );

  const deleteBtn = (
    <Col {...(isMobile ? { xs: 24, sm: 24 } : {})}>
      <DeleteButton
        {...(deleteBtnHandler ? { onClick: deleteBtnHandler } : {})}
        isfullwidth
      />
    </Col>
  );

  return (
    <Row>
      <Col sm={24} md={16} lg={13}>
        <h2 className="text-denim font-sharp-sans-bold text-3xl mb-3 mt-0">
          {title}
        </h2>
        <CustomDivider className="mt-2" />
      </Col>
      <Col xs={24} sm={24} md={8} lg={11}>
        <Row gutter={[5, 5]} className="flex md:justify-end lg:justify-end">
          {hasExportCSVBtn && CSVBtn}
          {hasAddBtn && addBtn}
          {hasUpdateBtn && updateBtn}
          {hasDeleteBtn && deleteBtn}
          {customDeleteBtn && customDeleteBtn}
        </Row>
      </Col>
    </Row>
  );
};

export default ContentHeader;
