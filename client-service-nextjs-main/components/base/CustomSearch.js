import React from "react";
import { Input } from "antd";

const CustomSearch = (props) => {
  const { onChange, className, placeholder, disabled } = props;

  const baseClassName =
    "uplist-search text-base text-neutral-2 pl-5 pr-4 h-full w-fit border-neutral-5 hover:border-denim focus:border-denim border-solid rounded outline-none hover:outline-none focus:outline-none bg-transparent font-sharp-sans-medium ";

  return (
    <Input
      disabled={disabled}
      prefix={
        <img
          src={`${window.location.origin}/icon/searchIcon.png`}
          alt="search"
          loading="lazy"
        />
      }
      type="search"
      placeholder={placeholder}
      onChange={onChange}
      className={baseClassName + (className || "")}
      style={{ minHeight: 40 }}
      allowClear
    />
  );
};

export default CustomSearch;
