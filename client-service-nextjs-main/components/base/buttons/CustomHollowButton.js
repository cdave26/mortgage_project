import React from "react";

import { Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

/**
 * Custom Hollow Button
 * @param {*} props
 */
const CustomHollowButton = (props) => {
  const { isloading, isfullwidth, ...btnProps } = props;
  let baseClassNames =
    "text-base bg-white text-neutral-1 font-sharp-sans-semibold h-full whitespace-normal break-all border-2 border-xanth rounded-lg px-5 py-2 ";

  if (isfullwidth) {
    baseClassNames += "w-full ";
  }

  return (
    <Button
      {...btnProps}
      className={baseClassNames + (btnProps.className || "")}
    >
      {isloading === "true" ? <LoadingOutlined /> : btnProps.label}
    </Button>
  );
};

export default CustomHollowButton;
