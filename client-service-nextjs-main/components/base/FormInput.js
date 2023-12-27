import React from "react";

import { Input } from "antd";

/**
 * Form input field
 * @param {*} props
 */
const FormInput = (props) => {
  const { ...inputProps } = props;
  const baseClassNames = "form-item-input ";

  return (
    <Input
      {...inputProps}
      className={baseClassNames + (inputProps.className || "")}
    />
  );
};

export default FormInput;
