import React from 'react';

import { Divider } from 'antd';

/**
 * Custom Divider
 * @param {*} props
 */
const CustomDivider = (props) => {
  const { ...btnProps } = props;
  const baseClassNames = 'w-full ';

  return (
    <Divider
      className={baseClassNames + (btnProps.className || '')}
      style={{
        borderBlockStart: `8px solid ${props.color ?? '#FFC160'}`,
        maxWidth: '180px',
        minWidth: '180px',
        margin: '0 0 16px 0',
      }}
    />
  );
};

export default CustomDivider;
