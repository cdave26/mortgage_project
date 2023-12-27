import React from "react";
import { ConfigProvider, Select as SelectOption } from "antd";

/**
 * Select option component
 * @param {Object} props
 * @returns
 */

const Select = (props) => {
  const {
    isbuyer = false,
    disabled,
    withsearch = "",
    statesearch = "",
  } = props;
  const baseClassName = `${
    disabled ? "text-neutral-3" : "text-neutral-1"
  } font-sharp-sans-medium `;

  let defaultProperties = {
    defaultValue: props.initialvalue,
    className: baseClassName + (props.className || ""),
  };

  const withSearchProperties = {
    allowClear: true,
    showSearch: true,
    filterOption: (input, option) => {
      const optionText = ((option?.label || option?.value) ?? "")
        .toLowerCase()
        .indexOf(input.toLowerCase());
      const matchesOnStart = optionText === 0;
      const matchesOn5thIndex = optionText === 5;

      return statesearch === "true"
        ? matchesOnStart || matchesOn5thIndex
        : matchesOnStart;
    },
  };

  if (withsearch === "true") {
    defaultProperties = { ...defaultProperties, ...withSearchProperties };
  }

  const buyerSelectorTheme = {
    inherit: false,
    token: {
      colorBgContainer: "#F0F8FF",
    },
  };

  return (
    <ConfigProvider theme={isbuyer && buyerSelectorTheme}>
      <SelectOption {...props} {...defaultProperties} />
    </ConfigProvider>
  );
};

export default Select;
