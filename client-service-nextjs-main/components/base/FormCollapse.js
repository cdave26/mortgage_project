import React from "react";
import { Collapse } from "antd";
import { DownOutlined } from "@ant-design/icons";

const FormCollapse = ({
  header,
  children,
  panelClassName,
  collapseClassName,
  collapsedDefault = true,
}) => {
  const { Panel } = Collapse;

  const baseCollapseClassName =
    "bg-white w-full mx-auto flex justify-center items-center flex-col ";

  return (
    <Collapse
      className={baseCollapseClassName + (collapseClassName || "")}
      defaultActiveKey={[!collapsedDefault ? "1" : ""]}
    >
      <Panel
        header={header}
        className={panelClassName}
        showArrow={false}
        extra={<DownOutlined style={{ fontSize: 18 }} />}
        key="1"
      >
        {children}
      </Panel>
    </Collapse>
  );
};

export default FormCollapse;
