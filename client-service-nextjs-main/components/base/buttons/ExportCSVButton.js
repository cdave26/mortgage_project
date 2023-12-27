import { Button } from "antd";
import React from "react";

const ExportCSVButton = (props) => {
  const { onClick, className } = props;

  const baseClassName =
    "flex justify-center items-center gap-3 px-5 border-2 border-solid rounded-lg border-xanth font-sharp-sans-semibold text-base whitespace-normal break-all hover:text-neutral-1 focus:text-neutral-1 text-neutral-1 ";

  return (
    <Button
      className={baseClassName + (className || "")}
      style={{ minHeight: 40, maxHeight: 40 }}
      onClick={onClick}
    >
      <img
        src={`${window.location.origin}/icon/csv.png`}
        alt="csv"
        loading="lazy"
      />
      <span>Export as CSV</span>
    </Button>
  );
};

export default ExportCSVButton;
