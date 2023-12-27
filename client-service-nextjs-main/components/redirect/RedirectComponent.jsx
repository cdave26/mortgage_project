import { LoadingOutlined } from "@ant-design/icons";
import React from "react";

const RedirectComponent = () => {
  return (
    <div className="h-screen flex-col flex text-center justify-center items-center">
      <LoadingOutlined className="items-center justify-center text-denim text-5xl mb-5" />
      <p className="text-neutral-1 mt-0 font-sharp-sans-medium text-base">
        Please wait for a while we are checking some requirements.
      </p>
    </div>
  );
};

export default RedirectComponent;
