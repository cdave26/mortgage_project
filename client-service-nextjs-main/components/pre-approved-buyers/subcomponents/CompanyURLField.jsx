import React, { useState } from "react";
import { Popover, Skeleton } from "antd";
import { CheckCircleOutlined, CopyOutlined } from "@ant-design/icons";
import { clipboardWriteText } from "~/plugins/copyToClipboard";
import { useDispatch } from "react-redux";

const CompanyURLField = ({ loginUrl, isLoading }) => {
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const labels = "font-sharp-sans-medium text-neutral-3",
    results = "text-base font-sharp-sans-medium text-neutral-1";

  return (
    <div className="w-full flex-1">
      <div className={`user-details-header ${labels}`}>
        {`Login URL `}
        <Popover
          className="text-xanth"
          content={!visible && "Copy"}
          trigger={["hover"]}
        >
          {visible ? (
            <CheckCircleOutlined className="check-icon" />
          ) : (
            <CopyOutlined
              onClick={() => {
                setVisible(true);
                clipboardWriteText(loginUrl, dispatch);
              }}
            />
          )}
        </Popover>
      </div>
      <div
        className={`${
          isLoading ? "onloading" : "user-details-value"
        } ${results}`}
      >
        {isLoading ? (
          <Skeleton paragraph={{ rows: 0 }} />
        ) : (
          <span className="break-all">{loginUrl || "-"}</span>
        )}
      </div>
    </div>
  );
};

export default CompanyURLField;
