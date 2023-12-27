import React, { forwardRef } from "react";

import { Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

/**
 * Custom Button
 * @param {*} props
 */
const CustomButton = forwardRef((props, ref) => {
  const { isloading, isfullwidth, isbuyer, iscalltoaction, ...btnProps } =
    props;

  const renderColors = () => {
    if (iscalltoaction) return "bg-blue-2 border-blue-2 text-white";
    if (isbuyer) return "bg-denim border-denim text-neutral-1 text-white";

    return "text-base bg-xanth border-xanth text-neutral-1";
  };

  let baseClassNames = `${renderColors()} font-sharp-sans-semibold h-auto whitespace-normal break-all border-2 rounded-lg px-5 py-2 button-wrap `;

  if (isfullwidth) {
    baseClassNames += "w-full ";
  }

  return (
    <Button
      ref={ref}
      {...btnProps}
      className={baseClassNames + (btnProps.className || "")}
    >
      {isloading === "true" ? <LoadingOutlined /> : btnProps.label}
    </Button>
  );
});

export default CustomButton;
