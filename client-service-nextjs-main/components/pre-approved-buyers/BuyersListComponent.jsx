import Link from "next/link";
import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Col, Row, Space } from "antd";
import Table from "../Table/Table";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import CustomInput from "../base/CustomInput";
import dayjs from "dayjs";

import {
  deleteBuyerAction,
  getBuyerFromPageAction,
} from "~/store/buyer/action";
import { EmptyDataIcon } from "~/icons/icon";
import { exportCSV } from "~/plugins/exportCSV";
import { dateTimeFormat } from "~/plugins/dateTimeFormat";
import ContentHeader from "../base/common/ContentHeader";
import CustomSelect from "../base/CustomSelect";
import { getAllBuyersListAPI } from "~/store/buyer/api";
import { defaultPagination } from "~/utils/constants";
import downPaymentTypes from "~/enums/downPaymentTypes";
import ProgressModal from "../base/modal/ProgressModal";
import userTypesEnum from "~/enums/userTypes";
import CopyURLComponent from "../base/CopyURLComponent";

let timeout = setTimeout(function () {}, 0);
const BuyersList = () => {
  const dispatch = useDispatch();
  const [processCSV, setProcessCSV] = useState(false);
  const [filterName, setFilterName] = useState(null);
  const [filterPropertyType, setFilterPropertyType] = useState([]);
  const [filterState, setFilterState] = useState([]);
  const [filterLoanOfficer, setFilterLoanOfficer] = useState(null);
  const [orderByFilter, setOrderByFilter] = useState({ created_at: "DESC" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPagination.pageSize);
  const [isDelete, setIsDelete] = useState({
    isOpen: false,
    inProgress: false,
    buyerId: null,
    buyer: null,
  });
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState(0);
  const [selectedStates, setSelectedStates] = useState(0);

  const { user, states, buyer, isLoading, propertyTypes } = useSelector(
    ({ auth, licenseStates, buyer, propertyType }) => {
      return {
        user: auth.data.user,
        states: licenseStates.states.data,
        buyer: buyer.list,
        isLoading: buyer.isLoading,
        propertyTypes: propertyType.items,
      };
    },
    shallowEqual
  );

  const { userType, companyId, loginUrl } = useSelector(({ auth }) => {
    return {
      userType: auth.data.user?.user_type?.id,
      companyId: auth.data.user?.company_id,
      loginUrl: auth.data.user?.login_url,
    };
  }, shallowEqual);

  const isLoanOfficer = userType === userTypesEnum.LOAN_OFFICER;
  const isCompanyAdmin = userType === userTypesEnum.COMPANY_ADMIN;
  const showLoginUrl = userType !== userTypesEnum.UPLIST_ADMIN;

  useEffect(() => {
    const filterOptions = {
      name: filterName,
      property_type: filterPropertyType,
      state: filterState,
      order_by: orderByFilter ?? { created_at: "DESC" },
      page: currentPage,
      per_page: pageSize,
      ...(!isLoanOfficer && { loan_officer: filterLoanOfficer }),
      ...(isCompanyAdmin && { company: companyId }),
    };

    let requiredFilters = { ...filterOptions };

    if (filterOptions.name && !filterOptions.loan_officer) {
      delete requiredFilters.loan_officer;
    } else if (!filterOptions.name && filterOptions.loan_officer) {
      delete requiredFilters.name;
    } else if (!filterOptions.name && !filterOptions.loan_officer) {
      delete requiredFilters.name;
      delete requiredFilters.loan_officer;
    }

    dispatch(getBuyerFromPageAction(requiredFilters));
  }, [
    orderByFilter,
    currentPage,
    pageSize,
    filterName,
    filterPropertyType,
    filterState,
    filterLoanOfficer,
  ]);

  const deleteItem = (id, buyer) => {
    return generateNavigator({
      id: id,
      buyer: buyer,
      imageLoc: `${window.location.origin}/icon/deleteIcon.png`,
      alt: "delete-icon",
      isDelete: true,
      onClick: deleteModalHandler,
    });
  };

  const columns = [
    {
      title: "First Name",
      dataIndex: "borrower_first_name",
      key: "firstName",
      sorter: () => {},
    },
    {
      title: "Last Name",
      dataIndex: "borrower_last_name",
      key: "lastName",
      sorter: () => {},
    },
    {
      title: "Occupancy",
      dataIndex: "occupancy_type",
      key: "occupancy",
      sorter: () => {},
    },
    {
      title: "Property Type",
      dataIndex: "property_type",
      key: "propertyType",
      sorter: () => {},
    },
    {
      title: "State",
      dataIndex: "property_state",
      key: "state",
      sorter: () => {},
    },
    {
      title: "Real Estate Agent",
      dataIndex: "agent_name",
      key: "realEstateAgent",
      sorter: () => {},
    },
    {
      title: "Loan Officer",
      dataIndex: "loan_officer_name",
      key: "loanOfficer",
      sorter: () => {},
    },
    {
      title: "Date Created",
      dataIndex: "created_at",
      key: "dateCreated",
      sorter: () => {},
    },
    {
      title: "",
      dataIndex: "id",
      width: "4%",
      key: "actions",
      fixed: "right",
      render: (id, buyer) => (
        <Space size="middle" style={{ cursor: "pointer" }}>
          {deleteItem(id, buyer)}
        </Space>
      ),
    },
  ];

  const deleteModalHandler = (id, buyer) => {
    setIsDelete({ isOpen: true, inProgress: false, buyerId: id, buyer });
  };

  const generateNavigator = ({
    id,
    buyer,
    link = "",
    imageLoc,
    alt,
    label = null,
    isDelete = false,
    onClick,
  }) => {
    const linkComponent = (
      <Link href={link}>
        <div
          className="flex items-center justify-between"
          role="button"
          onClick={() => onClick(id)}
        >
          <img src={imageLoc} alt={alt} />
          {label && (
            <div
              style={{ flex: 1, marginLeft: "12px" }}
              className="text-neutral-2"
            >
              {label}
            </div>
          )}
        </div>
      </Link>
    );

    const buttonComponent = (
      <div
        className="flex items-center justify-between"
        role="button"
        onClick={() => onClick(id, buyer)}
      >
        <img src={imageLoc} alt={alt} />
        {label && (
          <div
            style={{ flex: 1, marginLeft: "15px" }}
            className="text-neutral-2"
          >
            {label}
          </div>
        )}
      </div>
    );

    return isDelete ? buttonComponent : linkComponent;
  };

  const handleDelete = async (id, buyer) => {
    setIsDelete({ ...isDelete, inProgress: true });

    const response = await deleteBuyerAction(id, user, buyer, dispatch);
    response &&
      setIsDelete({
        isOpen: false,
        inProgress: false,
        buyerId: null,
        buyer: null,
      });
  };

  const modalFooterHandler = (actionType) => {
    switch (actionType) {
      case "cancel":
        setIsDelete({
          isOpen: false,
          inProgress: false,
          buyerId: null,
          buyer: null,
        });
        break;
      case "confirm":
        handleDelete(isDelete.buyerId, isDelete.buyer);
        break;
      default:
        break;
    }
  };

  const handleNameFilter = async ({ target }) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setFilterName(target.value);
      setCurrentPage(1);
    }, 1000);
  };

  const handlePropertyTypeFilter = (value) => {
    const formatted = value.map((val) => val.label);
    setSelectedPropertyTypes(formatted.length);
    const selectedIds = getKeyIdValue(propertyTypes, formatted);
    setFilterPropertyType(selectedIds);
    setCurrentPage(1);
  };

  const handleHomeStateFilter = (values) => {
    const formatted = values.map((opt) => opt.value);
    const selectedIds = getKeyIdValue(states, formatted);
    setSelectedStates(selectedIds.length);
    setFilterState(selectedIds);
    setCurrentPage(1);
  };

  const handleLoanOfficerFilter = ({ target }) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setFilterLoanOfficer(target.value);
      setCurrentPage(1);
    }, 1000);
  };

  const getKeyIdValue = (items, values) => {
    const selectedIds = items
      .filter((option) => values.includes(option.value))
      .map((option) => option.key || option.id);

    return selectedIds;
  };

  const handleChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination;
    const { field, order } = sorter;
    const orderBy = order === "ascend" ? "ASC" : "DESC";
    setOrderByFilter(order && { [field]: orderBy });
    setCurrentPage(current);
    setPageSize(pageSize);
  };

  const onExportCSV = async () => {
    setProcessCSV(true);
    const controller = new AbortController();
    const { signal } = controller;

    const lookups = { 0: "No", 1: "Yes" };
    const parseAmount = (val) =>
      val || isNaN(val) ? parseFloat(val).toFixed(2) : 0;

    const filterOptions = {
      name: filterName,
      property_type: filterPropertyType,
      state: filterState,
      ...(!isLoanOfficer && { loan_officer: filterLoanOfficer }),
    };

    let requiredFilters = { ...filterOptions };

    if (filterOptions.name && !filterOptions.loan_officer) {
      delete requiredFilters.loan_officer;
    } else if (!filterOptions.name && filterOptions.loan_officer) {
      delete requiredFilters.name;
    } else if (!filterOptions.name && !filterOptions.loan_officer) {
      delete requiredFilters.name;
      delete requiredFilters.loan_officer;
    }

    try {
      const response = await getAllBuyersListAPI(requiredFilters, signal);

      if (response?.data?.buyers.length) {
        const currentDate = dateTimeFormat(
          new Date().toISOString(),
          "MM-DD-YYYY"
        );
        const formatted = response.data.buyers.map((item) => {
          return {
            ID: item.id,
            "Borrower First Name": item.borrower_first_name,
            "Borrower Last Name": item.borrower_last_name,
            "Borrower Email Address": item.borrower_email,
            "Co-borrower First Name": item.co_borrower_first_name ?? "",
            "Co-borrower Last Name": item.co_borrower_last_name ?? "",
            "Co-borrower Email Address": item.co_borrower_email ?? "",
            "Current Home Address": item.borrower_address,
            City: item.borrower_city,
            State: item.borrower_state,
            Zip: item.borrower_zip,
            "Contact Number": item.borrower_mobile_number,
            "Agent First Name": item.agent_first_name,
            "Agent Last Name": item.agent_last_name,
            "Agent Email Address": item.agent_email,
            "Property Type": item.property_type,
            "Occupancy Type": item.occupancy_type,
            "Number of Units": item.units_count,
            "Property State": item.property_state,
            "Property County": item.property_county,
            "Desired Purchase Price": parseAmount(item.purchase_price),
            "Max Down Payment Amt": parseAmount(item.max_down_payment),
            "Credit Score Range": item.credit_score_range,
            DTI: item.debt_to_income_ratio,
            "Max Qualifying Pmt (PITI + HOA Dues)": parseAmount(
              item.max_qualifying_payment
            ),
            "Default Down Payment":
              item.default_down_payment_type === downPaymentTypes.PERCENTAGE
                ? `${parseFloat(item.default_down_payment_value).toFixed(0)}%`
                : parseAmount(item.default_down_payment_value),
            "Homeowners Insurance": parseAmount(item.homeowners_insurance),
            "Self Employed": lookups[item.self_employed],
            "VA Eligible": lookups[item.veterans_affairs],
            "FTHB (First Time Home Buyer)":
              lookups[item.first_time_home_buyers],
            "Loan Officer": item.loan_officer_name,
            "Date Created": dayjs(item.created_at).format("MM-DD-YYYY"),
            "Last Updated": dayjs(item.updated_at).format("MM-DD-YYYY"),
          };
        });
        exportCSV(formatted, `buyer-list-${currentDate}`);
      } else {
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: "Warning",
            description: "Cannot export empty data.",
            position: "topRight",
            type: "warning",
          },
        });
      }
    } catch (err) {
      console.log("err", err);
      controller.abort;
    } finally {
      setProcessCSV(false);
    }
  };

  return (
    <div className="pb-16">
      <Row className="mt-7">
        <Col sm={24} md={24} lg={24}>
          <ContentHeader
            title={"Buyers"}
            hasExportCSVBtn
            hasAddBtn
            addBtnLabel={"Add a Buyer"}
            addBtnRoute={"/buyers/add"}
            CSVHandler={onExportCSV}
          />
          <Row>
            <Col span={24} className="mt-2">
              {showLoginUrl && (
                <CopyURLComponent
                  label={"Login URL"}
                  url={loginUrl}
                  isLoading={isLoading}
                  isbuyer
                />
              )}
            </Col>
          </Row>
          <Row gutter={[0, 20]} style={{ marginTop: 40 }}>
            <Col sm={24} md={24} lg={24} style={{ marginBottom: -2 }}>
              <Row gutter={[16, 10]}>
                <Col xs={24} md={12} lg={6}>
                  <CustomInput
                    onChange={handleNameFilter}
                    prefix={
                      <img
                        src={`${window.location.origin}/icon/searchIcon.png`}
                        alt="search"
                        loading="lazy"
                      />
                    }
                    placeholder="First Name or Last Name"
                  />
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <CustomSelect
                    placeholder="Property Type"
                    isMulti={true}
                    selectedcount={selectedPropertyTypes}
                    options={propertyTypes.map((type) => {
                      return {
                        label: type.value,
                        value: type.id,
                      };
                    })}
                    disabled={!propertyTypes.length}
                    name="property"
                    className="font-sharp-sans"
                    onChange={handlePropertyTypeFilter}
                  />
                </Col>
                <Col xs={24} md={12} lg={6}>
                  <CustomSelect
                    placeholder="Home State"
                    isMulti={true}
                    selectedcount={selectedStates}
                    options={states}
                    disabled={!states.length}
                    name="homestate"
                    className="font-sharp-sans"
                    onChange={handleHomeStateFilter}
                    statesearch="true"
                    withsearch="true"
                  />
                </Col>
                {!isLoanOfficer && (
                  <Col xs={24} md={12} lg={6}>
                    <CustomInput
                      onChange={handleLoanOfficerFilter}
                      prefix={
                        <img
                          src={`${window.location.origin}/icon/searchIcon.png`}
                          alt="search"
                          loading="lazy"
                        />
                      }
                      placeholder="Loan Officer"
                    />
                  </Col>
                )}
              </Row>
            </Col>
            <Col xs={24} md={24} lg={24} id="buyer-list-table">
              <Table
                rowClassName="cursor-pointer"
                columns={columns}
                dataSource={
                  Object.keys(buyer.buyers).length ? buyer.buyers : []
                }
                onChange={handleChange}
                onRow={(record) => {
                  return {
                    onClick: (event) => {
                      const { tagName } = event.target;

                      if (tagName !== "IMG") {
                        window.location.href = `/buyers/${record.id}`;
                      }
                    },
                  };
                }}
                pagination={{
                  defaultPageSize: defaultPagination.pageSize,
                  showSizeChanger: true,
                  pageSizeOptions: defaultPagination.pageOptions,
                  total: buyer.total,
                  current: buyer.page,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                }}
                scroll={{ x: 1280 }}
                rowKey="id"
                sortDirections={["ascend", "descend"]}
                loading={isLoading}
                locale={{
                  emptyText: (
                    <>
                      <EmptyDataIcon />
                      <div className="text-center mt-5">
                        <div className="ant-empty-description">
                          Buyer not Found
                        </div>
                      </div>
                    </>
                  ),
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <ConfirmDeleteModal
        title="You are about to delete a buyer"
        subtitle="Are you sure that you want to delete this buyer?"
        handleDelete={() => modalFooterHandler("confirm")}
        handleCancel={() => modalFooterHandler("cancel")}
        openModal={isDelete.isOpen}
        onProgress={isDelete.inProgress}
      />
      <ProgressModal open={processCSV} name="CSV" />
    </div>
  );
};

export default BuyersList;
