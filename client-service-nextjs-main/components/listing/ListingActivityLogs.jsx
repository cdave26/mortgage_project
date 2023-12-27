import React from "react";
import { Col } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { getListingLogsAction } from "~/store/listing/action";

import { formatLogsName } from "~/utils/listing";
import { addCommas } from "~/plugins/formatNumbers";
import { defaultPagination } from "~/utils/constants";

import Table from "../Table/Table";

const ListingActivityLogs = () => {
  const { pathname } = new URL(window.location.href);
  const listingId = pathname.split("/").pop();

  const dispatch = useDispatch();

  const { logs, logsLoading } = useSelector((state) => {
    return {
      logs: state.listings.listOfListingActivityLogs.list,
      logsLoading: state.listings.listOfListingActivityLogs.loading,
    };
  }, shallowEqual);

  const moneyColumns = [
    "property_value",
    "seller_credits",
    "loan_amount",
    "hoa_dues",
    "property_taxes",
    "homeowners_insurance",
  ];

  const formatLogsData = (val, record) => {
    if (moneyColumns.includes(record.column_name)) {
      return `$${addCommas(val, true)}`;
    }

    if (record.column_name === "default_down_payment") {
      return `${val}%`;
    }

    if (String(val) === "null") {
      return "";
    }

    return String(val);
  };

  const columns = [
    {
      title: "Name of Field",
      dataIndex: "column_name",
      key: "column_name",
      sorter: {},
      render: (props) => {
        return (
          <div>
            <span>{formatLogsName[props]}</span>
          </div>
        );
      },
    },
    {
      title: "Previous Value",
      dataIndex: "original_data",
      key: "original_data",
      ellipsis: true,
      render: (props, record) => {
        return (
          <div className="truncate">
            <span>{formatLogsData(props, record)}</span>
          </div>
        );
      },
    },
    {
      title: "New Value",
      dataIndex: "updated_data",
      key: "updated_data",
      ellipsis: true,
      render: (props, record) => {
        return (
          <div className="truncate">
            <span>{formatLogsData(props, record)}</span>
          </div>
        );
      },
    },
    {
      title: "Date Modified",
      dataIndex: "created_at",
      key: "created_at",
      sorter: {},
    },
    {
      title: "Modified By",
      dataIndex: "updated_by",
      key: "updated_by",
      sorter: {},
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      getListingLogsAction({
        listingId,
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: Object.keys(sorter).length ? sorter.field : "updated_at",
        order: sorter.order === "ascend" ? "asc" : "desc",
      })
    );
  };

  return (
    <Col className="flex-1 w-full h-auto border border-solid border-alice-blue box-border p-8 rounded-3xl">
      <h3 className="text-denim font-sharp-sans-bold text-2xl mt-0 mb-5">
        Activity Logs
      </h3>
      <Col className="mt-5">
        <Table
          columns={columns}
          dataSource={Object.keys(logs).length ? logs.data : []}
          onChange={onChange}
          pagination={{
            defaultPageSize: defaultPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: defaultPagination.pageOptions,
            total: Object.keys(logs).length ? logs.total : 0,
            current: Object.keys(logs).length ? logs.page : 1,
            showTotal: (total, range) => {
              return `Showing ${range[0]} to ${range[1]} of ${total} entries`;
            },
          }}
          scroll={{ x: 1280 }}
          loading={logsLoading}
        />
      </Col>
    </Col>
  );
};

export default ListingActivityLogs;
