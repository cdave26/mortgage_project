import React, { useEffect, useState } from "react";
import { Col, Dropdown, Form, Popconfirm, Row, Space, Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { CloseOutlined } from "@ant-design/icons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import {
  deleteListingAction,
  getAllListingsAction,
  getListingsAction,
  onSearchListingTypingAction,
  updateListingAction,
} from "~/store/listing/action";
import { LISTINGS } from "~/store/listing/type";
import { onHandleError } from "~/error/onHandleError";
import { exportCSV } from "~/plugins/exportCSV";
import { addCommas } from "~/plugins/formatNumbers";
import config from "~/config";
import { publishable } from "~/utils/listing";
import { defaultPagination } from "~/utils/constants";

import Table from "../Table/Table";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import CustomSearch from "../base/CustomSearch";
import ListingConfirmUpdateComponent from "./ConfirmUpdateComponent";
import ContentHeader from "../base/common/ContentHeader";
import CustomSelect from "../base/CustomSelect";
import ProgressModal from "../base/modal/ProgressModal";
import CopyURLComponent from "../base/CopyURLComponent";

let timeout = setTimeout(function () {}, 0);

const ListingList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [form] = Form.useForm();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  const isUplistAdmin = userData?.user_type_id === 1;

  const { listings, loadingListings, listingStatuses, loadingListingStatuses } =
    useSelector((state) => {
      return {
        listings: state.listings.listOfListings.list,
        loadingListings: state.listings.listOfListings.loading,
        listingStatuses: state.listingStatus.statuses.data,
        loadingListingStatuses: state.listingStatus.statuses.loading,
      };
    }, shallowEqual);

  const { search, sortBy, order, limit } = useSelector(
    (state) => state.listings.listOfListings,
    shallowEqual
  );

  const [editingKey, setEditingKey] = useState("");
  const [toEdit, setToEdit] = useState({});
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCheckedStatus, setIsCheckedStatus] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processCSV, setProcessCSV] = useState(false);
  const [isDelete, setIsDelete] = useState({
    open: false,
    listingtoDelete: null,
    onProgress: false,
  });
  const [agentListingUrl, setAgentListingURL] = useState({
    loading: false,
    url: null,
  });

  useEffect(() => {
    if (userData && Object.keys(userData).length) {
      setAgentListingURL({ ...agentListingUrl, loading: true });
      const url = `${config?.appUrl}/${userData?.company?.code}/agent-listing/${userData?.nmls_num}-${userData?.url_identifier}`;

      setTimeout(() => {
        setAgentListingURL({ ...agentListingUrl, url, loading: false });
      }, 2000);
    }
  }, [userData]);

  const isEditing = (record) => record.key === editingKey;

  const handleSelect = (value, record) => {
    setToEdit({
      ...record,
      listing_status: value,
    });
    setSelectedStatus(value);
    setShowConfirmModal(true);
  };

  const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            style={{ margin: 0 }}
            name={dataIndex}
            rules={config.requiredRule.slice(0, 1)}
          >
            <CustomSelect
              placeholder="Select Status"
              options={listingStatuses}
              disabled={loadingListingStatuses}
              onChange={(val) => handleSelect(val?.value, record)}
            />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  const handleCancelEdit = () => {
    setEditingKey("");
  };

  const snackBar = (message, description, type) => {
    dispatch({
      type: "UI/snackbars",
      payload: {
        open: true,
        message,
        description,
        position: "topRight",
        type,
      },
    });
  };
  const removeDecimalFormat = (value) => {
    return `$${addCommas(parseFloat(value).toFixed(0))}`;
  };

  const handleUpdate = async () => {
    if (publishable.includes(selectedStatus) && !isCheckedStatus) {
      snackBar(
        "",
        "Please verify that the property is eligible for financing.",
        "error"
      );
      return;
    }

    setIsLoading(true);

    const controller = new AbortController();
    const { signal } = controller;

    try {
      delete toEdit.page_link;

      const response = await dispatch(
        updateListingAction(toEdit.id, toEdit, signal)
      );

      if (response.status === 200) {
        snackBar(response.data.message, "", "success");

        dispatch({
          type: LISTINGS.onProgress,
          payload: false,
        });

        setIsLoading(false);
        setEditingKey("");
        setToEdit({});
        setSelectedStatus("");
        setIsCheckedStatus(false);
        setShowConfirmModal(false);
        setIsLoading(false);
        controller.abort();

        // reload list
        dispatch(
          getListingsAction({
            page: 1,
            limit: defaultPagination.pageSize,
            search: "",
            sortBy: "updated_at",
            order: "desc",
          })
        );
      }
    } catch (error) {
      onHandleError(error, dispatch);
      setIsLoading(false);
      dispatch({
        type: LISTINGS.onProgress,
        payload: false,
      });
    }
  };

  const defaultColumns = [
    {
      title: "MLS Number",
      dataIndex: "mls_number",
      key: "mls_number",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Listing Agent",
      dataIndex: "listing_agent_name",
      key: "listing_agent_name",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Web Page",
      dataIndex: "page_link",
      key: "page_link",
      render: (props) => {
        return (
          <a
            href={props}
            rel="noopener noreferrer"
            target="_blank"
            className="flex items-center"
          >
            <span className="my-0 text-denim font-sharp-sans-medium underline">
              Webpage
            </span>
          </a>
        );
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: {},
      ellipsis: true,
      render: (props) => {
        return (
          <Tooltip placement="bottomLeft" title={props}>
            {props}
          </Tooltip>
        );
      },
      clickable: true,
    },
    {
      title: "List Price",
      dataIndex: "property_value",
      key: "property_value",
      sorter: {},
      clickable: true,
      render: (props) => {
        const formattedPrice = removeDecimalFormat(props);
        return (
          <div className="truncate">
            <span>{formattedPrice}</span>
          </div>
        );
      },
    },
    {
      title: "Credits",
      dataIndex: "seller_credits",
      key: "seller_credits",
      sorter: {},
      clickable: true,
      render: (props) => {
        const formattedPrice = removeDecimalFormat(props);
        return (
          props && (
            <div className="truncate">
              <span>{formattedPrice}</span>
            </div>
          )
        );
      },
    },
    {
      title: "Loan Officer",
      dataIndex: "loan_officer",
      key: "loan_officer",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Listing Status",
      dataIndex: "listing_status_desc",
      key: "listing_status_desc",
      sorter: {},
      editable: true,
      render: (props, record) => {
        return editingKey ? (
          <Popconfirm
            title="Sure to cancel other edited cells?"
            onConfirm={() => setEditingKey(record.key)}
          >
            <div className="editable-cell-value-wrap capitalize">{props}</div>
          </Popconfirm>
        ) : (
          <div
            className="editable-cell-value-wrap capitalize cursor-pointer truncate"
            onClick={() => setEditingKey(record.key)}
          >
            <span className="text-denim">{props}</span>
          </div>
        );
      },
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      width: "4%",
      fixed: "right",
      render: (props, record) => {
        const editable = isEditing(record);

        const items = [
          {
            key: "1",
            label: (
              <Link
                href={`/listings/view/${props.id}`}
                className="flex items-center justify-between mb-1"
              >
                <img
                  src={`${window.location.origin}/icon/eyeIcon.png`}
                  alt="eye-icon"
                />
                <span
                  style={{ flex: 1, marginLeft: "10px" }}
                  className="text-neutral-2 text-start"
                >
                  View
                </span>
              </Link>
            ),
          },
          {
            key: "2",
            label: (
              <Link
                href={`/listings/edit/${props.id}`}
                className="flex items-center justify-between"
              >
                <img
                  src={`${window.location.origin}/icon/editIcon.png`}
                  alt="edit-icon"
                />
                <span
                  style={{ flex: 1, marginLeft: "10px" }}
                  className="text-neutral-2"
                >
                  Edit
                </span>
              </Link>
            ),
          },
          {
            key: "3",
            label: (
              <div
                className="flex items-center justify-between"
                role="button"
                onClick={() => {
                  setIsDelete({
                    open: true,
                    listingtoDelete: props.id,
                  });
                }}
              >
                <img
                  src={`${window.location.origin}/icon/deleteIcon.png`}
                  alt="delete-icon"
                />
                <div
                  style={{ flex: 1, marginLeft: "15px" }}
                  className="text-neutral-2"
                >
                  Delete
                </div>
              </div>
            ),
          },
        ];

        return editable ? (
          <Space size="middle">
            <span>
              <Popconfirm
                placement="left"
                title="Are you sure you want to Cancel?"
                onConfirm={handleCancelEdit}
                okButtonProps={{
                  style: {
                    backgroundColor: "#FA657E",
                    border: "2px solid #FA657E",
                    color: "#F9F9FB",
                    fontFamily: "sharp-sans-semibold",
                  },
                }}
                cancelButtonProps={{
                  style: {
                    color: "rgba(0, 0, 0, 0.85)",
                    border: "2px solid #FFC160",
                    fontFamily: "sharp-sans-semibold",
                  },
                }}
              >
                <CloseOutlined />
              </Popconfirm>
            </span>
          </Space>
        ) : (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            arrow={true}
            type="default"
            size="medium"
            placement="bottomRight"
          >
            <div title="Click to show menu">
              <img
                src={`${window.location.origin}/icon/dot.png`}
                alt="dots"
                className="dots"
              />
            </div>
          </Dropdown>
        );
      },
    },
  ];

  const columns = defaultColumns.map((col) => {
    if (col.clickable) {
      return {
        ...col,
        onCell: (record) => ({
          record,
          title: col.title,
          onClick: (e) => {
            e.preventDefault();
            router.push(`/listings/view/${record.id}`);
          },
        }),
      };
    }
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const components = {
    body: {
      cell: EditableCell,
    },
  };

  /**
   * Hangdle on search
   * @param {Event} e
   * @returns {void}
   */
  const handleOnSearch = (e) => {
    clearTimeout(timeout);
    dispatch(onSearchListingTypingAction(e.target.value));

    timeout = setTimeout(() => {
      dispatch(
        getListingsAction({
          page: 1,
          limit,
          search: e.target.value,
          sortBy,
          order,
        })
      );
    }, 1000);
  };

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      getListingsAction({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
        sortBy: Object.keys(sorter).length ? sorter.field : "updated_at",
        order: sorter.order === "ascend" ? "asc" : "desc",
      })
    );
  };

  /**
   * On delete listing or cancel delete
   * @param {String} typeOfAction
   * @returns {void}
   */
  const footerOnAction = async (typeOfAction) => {
    if (typeOfAction === "cancel") {
      setIsDelete({
        open: false,
        listingtoDelete: null,
      });
    } else if (typeOfAction === "confirm") {
      setIsDelete({
        ...isDelete,
        onProgress: true,
      });
      const response = await dispatch(
        deleteListingAction(isDelete.listingtoDelete)
      );

      if (response) {
        setIsDelete({
          open: false,
          listingtoDelete: null,
          onProgress: false,
        });
      } else {
        setIsDelete({
          ...isDelete,
          onProgress: false,
        });
      }
    }
  };

  const onExportCSV = async () => {
    setProcessCSV(true);
    const controller = new AbortController();
    const { signal } = controller;

    const parseAmount = (val) =>
      val || isNaN(val) ? parseFloat(val).toFixed(2) : 0;

    const lookups = { 0: "No", 1: "Yes" };
    const dd = dayjs().format("MM-DD-YYYY");

    try {
      const listings = await getAllListingsAction({ search, signal });

      if (!listings.length) {
        snackBar("Cannot export empty data.", "", "warning");
        return;
      }

      const formatted = listings.map((listing) => {
        return {
          "MLS Number": listing.mls_number,
          "Listing Agent": listing.listing_agent_name,
          "Listing Agent Email": listing.listing_agent_email,
          "Web Page": listing.page_link,
          "List Price": listing.property_value,
          "Loan Amount": listing.loan_amount,
          "Property Taxes": parseAmount(listing.property_taxes),
          "HOA Dues": parseAmount(listing.hoa_dues),
          Insurance: parseAmount(listing.homeowners_insurance),
          "Seller Credits": listing.seller_credits,
          "Credit Verified By": listing.credit_verified_by,
          Address: listing.property_address,
          "Apt. Suite": listing.property_apt_suite ?? "",
          City: listing.property_city,
          State: listing.state,
          Zip: listing.property_zip,
          "Property Type": listing.property_type_desc,
          "Number of Units": listing.units_count_desc,
          "Default Down Payment": `${listing.default_down_payment}%`,
          "Listing Status": listing.listing_status_desc,
          "Loan Officer": listing.email,
          "Loan Officer Email": listing.loan_officer,
          "Loan Officer Contact Number": listing.mobile_number,
          "Licensing State": listing.user_license_state,
          "licensing Number": listing.license,
          "USDA Lookup": lookups[listing.usda_lookup],
          "VA Lookup": lookups[listing.va_condo_lookup],
          "FHA Lookup": lookups[listing.fha_condo_lookup],
          "Created At": dayjs(listing.created_at).format("MM-DD-YYYY"),
          "Last Updated": dayjs(listing.updated_at).format("MM-DD-YYYY"),
        };
      });

      exportCSV(formatted, `listings-list-${dd}`);
    } catch (err) {
      console.log("err", err);
      controller.abort();
    } finally {
      setProcessCSV(false);
    }
  };

  return (
    <div className="pb-16">
      <Row className="mt-7">
        <Col sm={24} md={24} lg={24}>
          <ContentHeader
            title={"Listings"}
            hasExportCSVBtn
            hasAddBtn
            addBtnLabel={"Add a Listing"}
            addBtnRoute={"/listings/add"}
            CSVHandler={onExportCSV}
          />
        </Col>
      </Row>
      {userData?.nmls_num && (
        <Row>
          <Col span={24} className="mt-2">
            <CopyURLComponent
              label="Agent Listing input URL"
              isLoading={agentListingUrl.loading}
              url={agentListingUrl.url}
            />
          </Col>
        </Row>
      )}
      <Row className="mt-10 mb-5">
        <CustomSearch onChange={handleOnSearch} placeholder="Search MLS" />
      </Row>
      <Col id="_listing-container_">
        <Form form={form} component={false}>
          <Table
            rowClassName="cursor-pointer"
            components={components}
            columns={columns}
            dataSource={Object.keys(listings).length > 0 ? listings.data : []}
            onChange={onChange}
            pagination={{
              defaultPageSize: defaultPagination.pageSize,
              showSizeChanger: true,
              pageSizeOptions: defaultPagination.pageOptions,
              total: Object.keys(listings).length > 0 ? listings.total : 0,
              current:
                Object.keys(listings).length > 0 ? listings.current_page : 1,
              showTotal: (total, range) => {
                return `Showing ${range[0]} to ${range[1]} of ${total} entries`;
              },
            }}
            scroll={{ x: 1280 }}
            loading={loadingListings}
          />
        </Form>
      </Col>
      <ConfirmDeleteModal
        title="You are about to delete a listing"
        subtitle="Flyers associated with this listing will be automatically archived."
        handleDelete={() => footerOnAction("confirm")}
        handleCancel={() => footerOnAction("cancel")}
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
      />
      <ListingConfirmUpdateComponent
        selectedStatus={selectedStatus}
        open={showConfirmModal}
        onCancel={() => {
          setToEdit({});
          setSelectedStatus("");
          setShowConfirmModal(false);
          setIsCheckedStatus(false);
          setIsLoading(false);
        }}
        onSubmit={handleUpdate}
        disabled={isLoading}
        isLoading={isLoading}
        setIsCheckedStatus={() => setIsCheckedStatus(!isCheckedStatus)}
        isCheckedStatus={isCheckedStatus}
        source="list"
      />
      <ProgressModal open={processCSV} name="CSV" />
    </div>
  );
};

export default ListingList;
