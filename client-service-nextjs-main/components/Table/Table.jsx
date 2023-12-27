import React from "react";
import { Table as TableComponents } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Table = (props) => {
  return (
    <TableComponents
      {...props}
      columns={props.columns}
      dataSource={props.dataSource}
      pagination={props.pagination}
      loading={{
        spinning: props.loading ?? false,
        indicator: <LoadingOutlined className="text-denim text-3xl" spin />,
      }}
      onChange={props.onChange}
      scroll={props.scroll}
    />
  );
};

export default Table;
