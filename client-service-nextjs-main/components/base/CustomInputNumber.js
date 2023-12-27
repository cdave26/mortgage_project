import React from "react";
import { InputNumber, ConfigProvider } from "antd";
import {
  addCommas,
  removeCommas,
  removeDecimal,
} from "~/plugins/formatNumbers";

/**
 * Form input number field
 * @param {*} props
 */
const CustomInputNumber = (props) => {
  const { isbuyer = false, ...inputNumberProps } = props;
  const baseClassNames = `font-sharp-sans-medium ${
    inputNumberProps.disabled
      ? "text-neutral-3 bg-disabled"
      : `${
          !isbuyer && "bg-white"
        } text-neutral-1 hover:border-denim focus:border-denim`
  } flex w-full rounded text-base `;

  const maxNumber = inputNumberProps.maxnumber ?? 9999999999999;
  const minNumber = inputNumberProps.min ?? 0;
  const precision = inputNumberProps.precision ?? 2;

  const maxInput = inputNumberProps.type === "percent" ? 100 : maxNumber;

  const symbol = inputNumberProps.symbol ?? "$";

  const formatter = (val) => {
    switch (inputNumberProps.type) {
      case "percent":
        return `${val}%`;
      case "wholeNumber":
        return val && addCommas(removeDecimal(val));
      default:
        return `${inputNumberProps.showsymbol ? symbol : ""}${val}`.replace(
          /\B(?=(\d{3})+(?!\d))/g,
          ","
        );
    }
  };

  const parser = (val) => {
    switch (inputNumberProps.type) {
      case "percent":
        return val.replace("%", "");
      case "wholeNumber":
        return Math.round(removeCommas(val));
      default:
        return val.replace(/\$\s?|(,*)/g, "");
    }
  };

  const buyerInputTheme = {
    inherit: false,
    token: {
      colorBgContainer: "#F0F8FF",
    },
  };

  return (
    <ConfigProvider theme={isbuyer && buyerInputTheme}>
      <InputNumber
        {...inputNumberProps}
        precision={precision}
        controls={inputNumberProps.controls || false}
        min={minNumber}
        max={maxInput}
        className={baseClassNames + (inputNumberProps.className || "")}
        formatter={(value) => formatter(value)}
        parser={(value) => parser(value)}
      />
    </ConfigProvider>
  );
};

export default CustomInputNumber;
