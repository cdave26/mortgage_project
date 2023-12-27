import React from "react";
import { Col, Form, Popover } from "antd";
import { InfoCircleFilled } from "@ant-design/icons";

const FormItem = Form.Item;

/**
 * Form item wrapper
 * @param {*} props
 */
const CustomFormItem = (props) => {
  const {
    disabled,
    footnote,
    isfootnotecomponent = false,
    mb,
    required,
    label,
    children,
    isbuyer = false,
    additionalInfo,
    ...formItemProps
  } = props;
  let marginBottom = "mb-6 ";

  if (mb) {
    marginBottom = `mb-${mb}`;
  }

  if (footnote) {
    marginBottom = `mb-0`;
  }

  const constructFootnote = (footNote) => {
    if (isfootnotecomponent) {
      return footNote;
    }

    return (
      <p
        className={`text-neutral-3 font-sharp-sans-medium mb-${
          mb ?? "6"
        } mt-1 text-xs`}
      >
        {footNote}
      </p>
    );
  };

  return (
    <Col className={marginBottom}>
      <p
        className={`${
          !isbuyer ? "truncate line-clamp-2 text-xs" : "text-ssm"
        } ${
          disabled ? "text-neutral-4" : "text-neutral-2"
        } font-sharp-sans-semibold mb-1 mt-0 `}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: label,
          }}
        />
        {/* {label} */}
        {required && <span className="text-error">*</span>}
        {additionalInfo && (
          <Popover content={additionalInfo} trigger={["click", "hover"]}>
            <InfoCircleFilled
              className={`ml-1 ${isbuyer ? "text-buyer" : "text-xanth"}`}
            />
          </Popover>
        )}
      </p>
      <FormItem {...formItemProps} className={marginBottom}>
        {children}
      </FormItem>
      {footnote && constructFootnote(footnote)}
    </Col>
  );
};

export default CustomFormItem;
