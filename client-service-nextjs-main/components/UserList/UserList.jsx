import Link from "next/link";
import React, { useState } from "react";
import Table from "../Table/Table";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  getUserListAction,
  onSearchTypingAction,
  isEditUserAction,
  userToUpdateAction,
  deleteUserAction,
} from "~/store/users/action";
import { Dropdown, Row } from "antd";
import { useRouter } from "next/router";
import { userTypeURL } from "~/plugins/userTypeURL";
import { exportCSV } from "~/plugins/exportCSV";
import { dateTimeFormat } from "~/plugins/dateTimeFormat";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import ContentHeader from "../base/common/ContentHeader";
import CustomSelect from "../base/CustomSelect";
import { getAllUsersAPI } from "~/store/users/api";
import { defaultPagination, userTypeConstants } from "~/utils/constants";
import dayjs from "dayjs";
import ProgressModal from "../base/modal/ProgressModal";

let timeout = setTimeout(function () {}, 0);
const UserList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { users, loading, company, priceEngine } = useSelector((state) => {
    return {
      users: state.users.listOfUsers.list,
      loading: state.users.listOfUsers.loading,
      company: state.company.companyList.company,
      priceEngine: state.pricingEngine.pricing.data,
    };
  }, shallowEqual);

  const { priceEngineId, companyId, search, sortBy, filteredBy } = useSelector(
    (state) => state.users.listOfUsers,
    shallowEqual
  );

  const usersType = useSelector((state) => state.auth.userTypes, shallowEqual);

  const [processCSV, setProcessCSV] = useState(false);
  const [selectedCompanyCount, setSelectedCompanyCount] = useState(0);
  const [selectedPriceEngineCount, setSelectedPriceEngineCount] = useState(0);
  const [selectedUserTypeCount, setSelectedUserTypeCount] = useState(0);
  const [isDelete, setIsDelete] = useState({
    open: false,
    userToDelete: null,
    onProgress: false,
  });

  const defaultColumns = [
    {
      title: "ID",
      dataIndex: "employee_id",
      key: "employee_id",
      width: "10%",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "NMLS Number",
      dataIndex: "nmls_num",
      key: "nmls_num",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "User Type",
      dataIndex: "user_type_name",
      key: "user_type_name",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "URL Indentifier",
      dataIndex: "url_identifier",
      key: "url_identifier",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Company",
      dataIndex: "company_name",
      key: "company_name",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Price Engine",
      dataIndex: "pricing_engine",
      key: "pricing_engine",
      sorter: {},
      ellipsis: true,
      clickable: true,
    },
    {
      title: "Created On",
      dataIndex: "created_at",
      key: "created_at",
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
      render: (props) => {
        const items = [
          {
            key: "1",
            label: (
              <Link
                href={`/users/view/${props.id}`}
                className="flex items-center justify-between"
                style={{ marginBottom: "3px" }}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(`/users/view/${props.id}`);
                }}
              >
                <img
                  src={`${window.location.origin}/icon/eyeIcon.png`}
                  alt="eye-icon"
                />
                <span
                  className="text-neutral-2"
                  style={{
                    flex: 1,
                    marginLeft: "10px",
                    textAlign: "start",
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
                href={`/users/edit/${props.id}`}
                className="flex items-center justify-between"
                style={{ marginBottom: "4px" }}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(isEditUserAction(true));
                  router.push(`/users/edit/${props.id}`);
                }}
              >
                <img
                  src={`${window.location.origin}/icon/editIcon.png`}
                  alt="edit-icon"
                />
                <span
                  className="text-neutral-2"
                  style={{ flex: 1, marginLeft: "10px" }}
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
                    userToDelete: props,
                  });
                }}
              >
                <img
                  src={`${window.location.origin}/icon/deleteIcon.png`}
                  alt="delete-icon"
                />
                <div
                  className="text-neutral-2"
                  style={{ flex: 1, marginLeft: "15px" }}
                >
                  Delete
                </div>
              </div>
            ),
          },
        ];
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
          dataIndex: col.dataIndex,
          title: col.title,
          onClick: (e) => {
            e.preventDefault();
            router.push(`/users/view/${record.id}`);
          },
        }),
      };
    }
    return col;
  });

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      getUserListAction({
        page: pagination.current,
        limit: pagination.pageSize,
        priceEngineId,
        companyId,
        search,
        userType: userTypeURL(),
        sortBy: sorter.order
          ? encodeURIComponent(
              JSON.stringify({
                [sorter.field]: sorter.order === "ascend" ? "ASC" : "DESC",
              })
            )
          : sortBy,
        filteredBy,
      })
    );
  };

  /**
   * Hangdle on search
   * @param {Event} e
   * @returns {void}
   */

  const handleOnSearch = (e) => {
    clearTimeout(timeout);
    dispatch(onSearchTypingAction(e.target.value));
    timeout = setTimeout(() => {
      dispatch(
        getUserListAction({
          page: 1,
          limit: defaultPagination.pageSize,
          priceEngineId,
          companyId,
          search: e.target.value,
          userType: userTypeURL(),
          sortBy,
          filteredBy,
        })
      );
    }, 1000);
  };

  /**
   * On change of the select
   * @param {Array} value
   * @param {String} typeOfSelection
   */

  const handleChange = (value, typeOfSelection) => {
    if (typeOfSelection === "priceEngine")
      onDispatchSelection(value.toString(), typeOfSelection);
    else if (typeOfSelection === "company")
      onDispatchSelection(value.toString(), typeOfSelection);
    else if (typeOfSelection === "userType")
      onDispatchSelection(value.toString(), typeOfSelection);
  };

  /**
   * On dispatch selection
   * @param {String} selected
   * @param {String} typeOfSelected
   */

  const onDispatchSelection = (selected, typeOfSelected) => {
    dispatch(
      getUserListAction({
        page: 1,
        limit: defaultPagination.pageSize,
        priceEngineId:
          typeOfSelected === "priceEngine" ? selected : priceEngineId,
        companyId: typeOfSelected === "company" ? selected : companyId,
        search,
        userType: userTypeURL(),
        sortBy,
        filteredBy: typeOfSelected === "userType" ? selected : filteredBy,
      })
    );
  };

  const onExportCSV = async () => {
    setProcessCSV(true);
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const response = await getAllUsersAPI(
        search,
        companyId,
        priceEngineId,
        userTypeURL(),
        filteredBy,
        signal
      );

      if (response?.data.length > 0) {
        const dd = dateTimeFormat(new Date().toISOString(), "MM-DD-YYYY");
        const formattted = response.data.map((item) => {
          return {
            ID: item.employee_id,
            "NMLS Number": item.nmls_num,
            "First Name": item.first_name,
            "Last Name": item.last_name,
            Email: item.email,
            "Alternative Email": item.alternative_email ?? "",
            Username: item.username,
            "Job Title": item.job_title ?? "",
            "Mobile Number": item.mobile_number,
            "User Type": userTypeConstants[item.user_type_name],
            "URL Indentifier": item.url_identifier,
            Company: item.company_name,
            "Price Engine": item.pricing_engine,
            "User Status": item.user_status_desc,
            "Created On": dayjs(item.created_at).format("MM-DD-YYYY"),
            "Last Updated": dayjs(item.updated_at).format("MM-DD-YYYY"),
          };
        });
        exportCSV(formattted, `user-list-${dd}`);
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

  const onAddUser = (_) => {
    dispatch(isEditUserAction(false));
    dispatch(userToUpdateAction({}));
  };

  /**
   * On delete user or cancel delete
   * @param {String} typeOfAction
   * @returns {void}
   */
  const footerOnAction = async (typeOfAction) => {
    if (typeOfAction === "cancel") {
      setIsDelete({
        open: false,
        userToDelete: null,
        onProgress: false,
      });
    } else if (typeOfAction === "confirm") {
      setIsDelete({
        ...isDelete,
        onProgress: true,
      });
      const response = await dispatch(deleteUserAction(isDelete.userToDelete));

      if (response) {
        setIsDelete({
          open: false,
          userToDelete: null,
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

  return (
    <>
      <ContentHeader
        title={"Users"}
        hasExportCSVBtn
        hasAddBtn
        addBtnLabel={"Add User"}
        addBtnRoute={"/users/add"}
        CSVHandler={onExportCSV}
        addBtnHandler={onAddUser}
      />
      <div className="user-list flex flex-col lg:flex-row  justify-start gap-5 mt-10 w-full">
        <div className="search flex justify-start items-center gap-2 h-10 w-full md:w-80">
          <img
            src={`${window.location.origin}/icon/searchIcon.png`}
            alt="search"
            loading="lazy"
            className="ml-2"
          />
          <input
            type="search"
            placeholder={`${
              search ? search : "First Name, Last Name, or NMLS#"
            }`}
            onInput={handleOnSearch}
            value={search}
            className="sm:w-full"
          />
        </div>

        <div className="company w-full md:w-60">
          <CustomSelect
            isMulti={true}
            withsearch="true"
            options={company.map((item) => {
              return {
                ...item,
                value: String(item.value),
              };
            })}
            selectedcount={selectedCompanyCount}
            name="company"
            placeholder="Select Company"
            onChange={(e) => {
              const formatted = e.map((opt) => opt.value);
              setSelectedCompanyCount(formatted.length);
              handleChange(formatted, "company");
            }}
          />
        </div>

        <div className="price-engine w-full md:w-60">
          <CustomSelect
            isMulti={true}
            selectedcount={selectedPriceEngineCount}
            options={priceEngine.map((item) => {
              return {
                ...item,
                value: String(item.value),
              };
            })}
            name="priceEngine"
            placeholder="Select Price Engine"
            onChange={(e) => {
              const formatted = e.map((opt) => opt.value);
              setSelectedPriceEngineCount(formatted.length);
              handleChange(formatted, "priceEngine");
            }}
          />
        </div>
        {router.pathname === "/users" && (
          <div className="user-type w-full md:w-60">
            <CustomSelect
              isMulti={true}
              selectedcount={selectedUserTypeCount}
              options={usersType.data.map((item) => {
                return {
                  ...item,
                  value: String(item.value),
                };
              })}
              name="userType"
              placeholder="Select User Type"
              onChange={(e) => {
                const formatted = e.map((opt) => opt.value);
                setSelectedUserTypeCount(formatted.length);
                handleChange(formatted, "userType");
              }}
            />
          </div>
        )}
      </div>

      <div className="mt-5 pb-16" id="_user-list-table_">
        <Table
          rowClassName="cursor-pointer"
          columns={columns}
          dataSource={Object.keys(users).length > 0 ? users.data : []}
          onChange={onChange}
          pagination={{
            defaultPageSize: defaultPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: defaultPagination.pageOptions,
            total: Object.keys(users).length > 0 ? users.total : 0,
            current: Object.keys(users).length > 0 ? users.page : 1,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
          scroll={{ x: 1280 }}
          loading={loading}
          locale={{
            emptyText: (
              <>
                <svg width="64" height="41" viewBox="0 0 64 41">
                  <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                    <ellipse
                      fill="#f5f5f5"
                      cx="32"
                      cy="33"
                      rx="32"
                      ry="7"
                    ></ellipse>
                    <g fillRule="nonzero" stroke="#d9d9d9">
                      <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                      <path
                        d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
                        fill="#fafafa"
                      ></path>
                    </g>
                  </g>
                </svg>
                <div className="text-center mt-5">
                  <div className="ant-empty-description">User not Found</div>
                </div>
              </>
            ),
          }}
        />
      </div>
      <ConfirmDeleteModal
        title="You are about to delete a user"
        subtitle="Flyers associated with this user will be automatically archived."
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
        handleDelete={() => footerOnAction("confirm")}
        handleCancel={() => footerOnAction("cancel")}
      />
      <ProgressModal open={processCSV} name="CSV" />
    </>
  );
};

export default UserList;
