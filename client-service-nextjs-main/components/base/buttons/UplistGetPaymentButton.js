import { Button } from "antd";
import React from "react";

import { UplistGetPaymentIcon } from "~/icons/icon";

const UplistGetPaymentButton = ({
  isBuyer = false,
  loadingGetPayments = false,
}) => {
  let color = "bg-xanth border-xanth";

  if (isBuyer) {
    color = "bg-san-marino border-san-marino";
  }

  return (
    <div className="flex flex-col items-center">
      <div>
        <Button
          className={`py-1 pr-[5px] pl-5 text-neutral-1 h-full w-auto rounded-full ${color}`}
          htmlType="submit"
          disabled={loadingGetPayments}
        >
          <div className="flex items-center justify-between h-full">
            <span
              className={`mr-[10px] text-[15px] font-[arial] font-normal ${
                isBuyer ? "text-white" : ""
              }`}
              style={{ lineHeight: "normal" }}
            >
              GET PAYMENTS
            </span>
            <UplistGetPaymentIcon fill={isBuyer ? "white" : "black"} />
          </div>
        </Button>
      </div>
      <div className="flex items-center justify-center w-full h-full">
        <div>
          <span
            style={{ color: "#949494", lineHeight: "normal" }}
            className="text-xxs mr-1 font-[arial] h-full"
          >
            POWERED BY
          </span>
        </div>

        <img
          className="h-5"
          src={`${window.location.origin}/icon/uplistLabelLogo.png`}
          alt="uplist"
        />
      </div>
    </div>
  );
};

export default UplistGetPaymentButton;
