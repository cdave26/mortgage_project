import React from 'react';
import { AutoComplete as AutoCompleteAntd, Input } from 'antd';

const AutoComplete = (props) => {
  return (
    <AutoCompleteAntd
      {...props}
      style={{
        width: '100%',
      }}
      options={props.options}
      onSelect={props.onSelect}
      onSearch={props.onSearch}
      onFocus={props.onFocus}
      onChange={props.onChange}
      onBlur={props.onBlur}
    >
      <Input.Search size='large' placeholder={props.placeHolder} />
    </AutoCompleteAntd>
  );
};

export default AutoComplete;
