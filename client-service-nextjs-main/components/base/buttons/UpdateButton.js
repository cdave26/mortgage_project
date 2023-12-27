import React from "react";

import { LoadingOutlined } from "@ant-design/icons";
import Link from "next/link";

/**
 * Hollow Update Button
 * @param {*} props
 */
const UpdateButton = (props) => {
  const { isloading, isfullwidth, ...btnProps } = props;
  let baseClassNames =
    "border-solid rounded-lg border-2 border-xanth py-2.5 px-5 flex items-center bg-white text-neutral-1 font-sharp-sans-semi-bold h-full whitespace-normal break-all text-base place-content-center ";

  if (isfullwidth) {
    baseClassNames += "w-full ";
  }

  return (
    <Link
      {...btnProps}
      href={btnProps.href}
      className={baseClassNames + (btnProps.className || "")}
    >
      <img
        alt="update-icon"
        src={`${window.location.origin}/icon/editIconBlack.png`}
        className="mr-2"
        style={{ width: 14, height: 14 }}
      />
      {isloading === "true" ? <LoadingOutlined /> : "Update"}
    </Link>
  );
};

export default UpdateButton;
