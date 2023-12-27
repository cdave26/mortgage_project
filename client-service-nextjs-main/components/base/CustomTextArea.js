import React from 'react';
import { Input } from 'antd';

/**
 * Form input field
 * @param {*} props
 */
const CustomTextArea = (props) => {
  const { TextArea } = Input;
  const { ...inputProps } = props;
  const baseClassNames = `text-neutral-1 font-sharp-sans-medium text-base disabled:text-neutral-4 ${
    inputProps.disabled
      ? 'bg-disabled hover:border-disabled focus:border-disabled'
      : 'bg-white hover:border-denim focus:border-denim'
  } flex w-full rounded py-2 `;

  return (
    <TextArea
      {...inputProps}
      className={baseClassNames + (inputProps.className || '')}
    />
  );
};

export default CustomTextArea;
