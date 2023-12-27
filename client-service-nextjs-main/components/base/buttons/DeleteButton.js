import React from "react";

import { Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

/**
 * Hollow Delete Button
 * @param {*} props
 */
const DeleteButton = (props) => {
  const { isloading, isfullwidth, ...btnProps } = props;
  let baseClassNames =
    "place-content-center flex items-center bg-white text-error font-sharp-sans-semi-bold h-full whitespace-normal break-all text-base border-solid border-2 border-error rounded-lg py-2.5 px-6 ";

  if (isfullwidth) {
    baseClassNames += "w-full ";
  }

  return (
    <Button
      {...btnProps}
      className={baseClassNames + (btnProps.className || "")}
    >
      <img
        alt="delete-icon"
        src={`${window.location.origin}/icon/deleteIconRed.png`}
        className="mr-2"
      />
      {isloading === "true" ? <LoadingOutlined /> : "Delete"}
    </Button>
  );
};

export default DeleteButton;
