import { CloseCircleFilled, DownOutlined } from "@ant-design/icons";
import React from "react";
import Select from "react-select";

/**
 * Select option component
 * @param {Object} props
 * @returns
 */
const CustomSelect = (props) => {
  const {
    disabled,
    withsearch = "",
    statesearch = "",
    isClearable = true,
    isMulti,
    selectedcount = 0,
    isbuyer = "",
  } = props;

  /**
   *
   * Add the following props for different use-cases:
   * - withsearch="true" for searchable dropdown.
   * - statesearch="true" to cater State search (<abbreviation> - <state name>).
   * - isClearable={false} together with withsearch to prevent display
   *    of clear button in a searchable dropdown.
   * - selectedcount={<count>} to handle scrolling of select with multiple values
   *
   */

  const baseClassName = `${disabled ? "text-neutral-3" : "text-neutral-1"} ${
    selectedcount > 1 && "multiple-selected"
  } custom-select border- font-sharp-sans-medium text-base `;

  const defaultIndicator = {
    IndicatorSeparator: () => null,
    DropdownIndicator: () => {
      return <DownOutlined />;
    },
  };

  const withClearableIndicator = {
    IndicatorSeparator: () => null,
    DropdownIndicator: (props) => {
      return props?.hasValue ? null : <DownOutlined />;
    },
    ClearIndicator: (props) => {
      const {
        hasValue,
        innerProps: { ref, ...restInnerProps },
      } = props;
      return hasValue ? (
        <CloseCircleFilled
          {...restInnerProps}
          ref={ref}
          className="cursor-pointer"
        />
      ) : null;
    },
  };

  let defaultProperties = {
    ...props,
    defaultValue: props.initialvalue,
    isDisabled: props.disabled,
    isLoading: props.loading,
    isRtl: props.isrtl,
    isSearchable: false,
    classNamePrefix: "custom-select",
    className: baseClassName + (props.className || ""),
    components: isMulti ? withClearableIndicator : defaultIndicator,
  };

  const withSearchProperties = {
    isSearchable: true,
    isClearable,
    filterOption: (option, input) => {
      const optionText = ((option?.label || option?.value) ?? "")
        .toLowerCase()
        .indexOf(input.toLowerCase());
      const matchesOnStart = optionText === 0;
      const matchesOn5thIndex = optionText === 5;

      return statesearch === "true"
        ? matchesOnStart || matchesOn5thIndex
        : matchesOnStart;
    },
    components: isClearable ? withClearableIndicator : defaultIndicator,
  };

  if (withsearch === "true") {
    defaultProperties = { ...defaultProperties, ...withSearchProperties };
  }

  if (isbuyer === "true") {
    defaultProperties = {
      ...defaultProperties,
      styles: {
        valueContainer: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "#f0f8ff",
        }),
        control: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "#f0f8ff",
        }),
      },
    };
  }

  return <Select {...defaultProperties} />;
};

export default CustomSelect;
