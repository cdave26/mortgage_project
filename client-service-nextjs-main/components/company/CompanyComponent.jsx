import React, { useState } from "react";
import Link from "next/link";
import Table from "../Table/Table";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { EmptyDataIcon } from "~/icons/icon";
import { Dropdown } from "antd";
import { exportCSV } from "~/plugins/exportCSV";
import { COMPANY } from "~/store/company/type";
import { companyListAction, deleteCompanyAction } from "~/store/company/action";
import { useRouter } from "next/router";
import { dateTimeFormat } from "~/plugins/dateTimeFormat";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import ContentHeader from "../base/common/ContentHeader";
import CustomSelect from "../base/CustomSelect";
import { getListOfCompaniesAPI } from "~/store/company/api";
import dayjs from "dayjs";
import ProgressModal from "../base/modal/ProgressModal";
import { defaultPagination } from "~/utils/constants";

let timeout = setTimeout(function () {}, 0);
const CompanyComponent = () => {
  const { list, state, user } = useSelector((state) => {
    return {
      list: state.company.list,
      user: state.auth.data.user,
      state: state.licenseStates.states.data,
    };
  }, shallowEqual);

  const dispatch = useDispatch();

  const router = useRouter();
  const [selectedStateCount, setSelectedStateCount] = useState(0);
  const [processCSV, setProcessCSV] = useState(false);
  const [isDelete, setIsDelete] = useState({
    open: false,
    companyToDelete: null,
    onProgress: false,
  });

  const defaultColumns = [
    {
      title: "Company Name",
      dataIndex: "name",
      key: "name",
      sorter: {},
      width: "19%",
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Company NMLS#",
      dataIndex: "company_nmls_number",
      key: "company_nmls_number",
      sorter: {},
      width: "15%",
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: {},
      width: "19%",
      ellipsis: true,
      clickable: true,
    },
    {
      title: "City",
      dataIndex: "city",
      key: "",
      sorter: {},
      width: "15%",
      ellipsis: true,
      clickable: true,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: {},
      width: "13%",
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Zip",
      dataIndex: "zip",
      key: "zip",
      sorter: {},
      width: "6%",
      ellipsis: true,
      clickable: true,
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      width: "4%",
      fixed: "right",
      render: (props) => {
        const items = [
          {
            key: "1",
            label: (
              <Link
                href={`/company/${props.id}`}
                className="flex items-center justify-between"
                style={{ marginBottom: "3px" }}
              >
                <img
                  src={`${window.location.origin}/icon/eyeIcon.png`}
                  alt="eye-icon"
                />
                <span
                  style={{
                    flex: 1,
                    marginLeft: "10px",
                    textAlign: "start",
                    color: "#4B5A6A",
                  }}
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
                href={`/company/${props.id}`}
                className="flex items-center justify-between"
                style={{ marginBottom: "4px" }}
              >
                <img
                  src={`${window.location.origin}/icon/editIcon.png`}
                  alt="edit-icon"
                />
                <span
                  style={{
                    flex: 1,
                    marginLeft: "10px",
                    color: "#4B5A6A",
                  }}
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
                    ...isDelete,
                    open: true,
                    companyToDelete: props,
                  });
                }}
              >
                <img
                  src={`${window.location.origin}/icon/deleteIcon.png`}
                  alt="delete-icon"
                />
                <div
                  style={{
                    flex: 1,
                    marginLeft: "15px",
                    color: "#4B5A6A",
                  }}
                >
                  Delete
                </div>
              </div>
            ),
          },
        ].filter((item) => {
          if (Number(user.user_type_id) === 1) {
            return item;
          } else {
            if (item.key !== "3") {
              return item;
            }
          }
        });
        return (
          <Dropdown
            menu={{
              items,
            }}
            trigger={["click"]}
            arrow={true}
            type="default"
            size="medium"
            placement="bottomRight"
          >
            <div title="Click to show menu">
              <img
                className="dots"
                src={`${window.location.origin}/icon/dot.png`}
                alt="dots"
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
          dataIndex: col.dataIndex,
          title: col.title,
          onClick: (e) => {
            e.preventDefault();
            router.push(`/company/${record.id}`);
          },
        }),
      };
    }
    return col;
  });

  const onExportCSV = async () => {
    setProcessCSV(true);
    const controller = new AbortController();
    const { signal } = controller;

    const translateBool = { 0: "No", 1: "Yes" };
    const equal_housing = {
      equal_housing_lender: "Equal Housing Lender",
      equal_housing_opportunity: "Equal Housing Opportunity",
    };

    try {
      const response = await getListOfCompaniesAPI(
        list.name,
        list.company_nmls_number,
        list.state,
        signal
      );

      if (response?.data.length > 0) {
        const dd = dateTimeFormat(new Date().toISOString(), "MM-DD-YYYY");
        const formatted = response.data.map((item) => {
          return {
            "Company Name": item.name,
            "Company NMLS#": item.company_nmls_number,
            Address: item.address,
            City: item.city,
            State: item.state,
            Zip: item.zip,
            "Company Privacy Policy URL": item.company_privacy_policy_URL,
            "Company Terms of Service URL": item.company_terms_of_tervice_URL,
            "Company Phone Number": item.company_mobile_number,
            "Price Engine": item.pricing_engine.name,
            "Equal Housing": equal_housing[item.equal_housing],
            "Allow Loan Officer To Upload Logo":
              translateBool[item.allow_loan_officer_to_upload_logo],
            "Header Background Color": item.header_background_color,
            "Header Text Color": item.header_text_color,
            "Created At": dayjs(item.created_at).format("MM-DD-YYYY"),
            "Last Updated": dayjs(item.updated).format("MM-DD-YYYY"),
            "Company State Licenses": item.company_state_licenses,
          };
        });

        exportCSV(formatted, `company-list-${dd}`, true);
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
      controller.abort();
    } finally {
      setProcessCSV(false);
    }
  };

  const handleOnSearch = (e, typeOfTyping) => {
    clearTimeout(timeout);
    dispatch({
      type: COMPANY.onTyping,
      payload: {
        ...list,
        loading: true,
        [typeOfTyping]: e.target.value,
      },
    });

    timeout = setTimeout(() => {
      dispatch(
        companyListAction({
          name: typeOfTyping === "name" ? e.target.value : list.name,
          company_nmls_number:
            typeOfTyping === "company_nmls_number"
              ? e.target.value
              : list.company_nmls_number,
          state: list.state,
          page: 1,
          limit: defaultPagination.pageSize,
          sortBy: list.sortBy,
        })
      );
    }, 1000);
  };

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      companyListAction({
        name: list.name,
        company_nmls_number: list.company_nmls_number,
        state: list.state,
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: sorter.order
          ? encodeURIComponent(
              JSON.stringify({
                [sorter.field]: sorter.order === "ascend" ? "ASC" : "DESC",
              })
            )
          : "",
      })
    );
  };

  const handleDeleteCompany = async () => {
    setIsDelete({
      ...isDelete,
      onProgress: true,
    });
    const dd = await dispatch(deleteCompanyAction(isDelete.companyToDelete.id));

    if (dd) {
      setIsDelete({
        ...isDelete,
        open: false,
        companyToDelete: null,
        onProgress: true,
      });
    } else {
      setIsDelete({
        ...isDelete,
        onProgress: false,
      });
    }
  };

  /**
   * Company List
   * @param {Array} compList company list
   * @param {Array} stateList state list
   * @returns {Array} company list
   */
  const companyList = (compList, stateList) => {
    for (let i = 0; i < compList.length; i++) {
      const state = stateList.find(
        (item) =>
          item.value.split(" - ")[0] === compList[i].state.split(" - ")[0]
      );
      if (state) {
        compList[i].state = state.value;
      }
    }

    return compList;
  };

  return (
    <>
      <ContentHeader
        title={"Company"}
        hasExportCSVBtn
        hasAddBtn
        addBtnLabel={"Add a Company"}
        addBtnRoute={"/company/add"}
        CSVHandler={onExportCSV}
      />
      <div className="company flex justify-start flex-col lg:flex-row gap-5 mt-10 w-full">
        <div className="search flex justify-start items-center gap-2 h-10 w-full md:w-60">
          <input
            type="search"
            placeholder="Name"
            onInput={(e) => handleOnSearch(e, "name")}
            value={list.name}
          />
        </div>
        <div className="search flex justify-start items-center gap-2 h-10 w-full md:w-60">
          <input
            type="search"
            placeholder="NMLS Number"
            onInput={(e) => handleOnSearch(e, "company_nmls_number")}
            value={list.company_nmls_number}
          />
        </div>
        <div className="state w-full md:w-60">
          <CustomSelect
            isMulti={true}
            withsearch="true"
            statesearch="true"
            options={state.map((item) => {
              return {
                label: item.label,
                value: item.value,
              };
            })}
            selectedcount={selectedStateCount}
            name="state"
            placeholder="Select State"
            onChange={(opt) => {
              const formatted = opt.map((opt) => opt.value);
              setSelectedStateCount(formatted.length);
              dispatch(
                companyListAction({
                  name: list.name,
                  company_nmls_number: list.company_nmls_number,
                  state: encodeURIComponent(formatted.toString()),
                  page: 1,
                  limit: defaultPagination.pageSize,
                  sortBy: list.sortBy,
                })
              );
            }}
          />
        </div>
      </div>
      <div className="mt-5 pb-16" id="_compay-list-table_">
        <Table
          rowClassName="cursor-pointer"
          columns={columns}
          dataSource={
            list.loading
              ? Object.keys(list.company).length > 0
                ? companyList(list.company.data, state)
                : []
              : companyList(list.company.data, state)
          }
          onChange={onChange}
          pagination={{
            defaultPageSize: defaultPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: defaultPagination.pageOptions,
            total:
              Object.keys(list.company).length > 0 ? list.company.total : 0,
            current:
              Object.keys(list.company).length > 0
                ? list.company.current_page
                : 1,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
          scroll={{ x: 1280 }}
          loading={list.loading}
          locale={{
            emptyText: (
              <>
                <EmptyDataIcon />
                <div className="text-center mt-5">
                  <div className="ant-empty-description">Company not Found</div>
                </div>
              </>
            ),
          }}
        />
      </div>

      <ConfirmDeleteModal
        title="You are about to delete a company"
        subtitle="Are you sure that you want to delete this company?"
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
        handleDelete={handleDeleteCompany}
        handleCancel={() =>
          setIsDelete({
            open: false,
            companyToDelete: null,
            onProgress: false,
          })
        }
      />
      <ProgressModal open={processCSV} name="CSV" />
    </>
  );
};

export default CompanyComponent;
