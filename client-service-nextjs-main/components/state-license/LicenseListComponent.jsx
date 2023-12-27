import React, { useState } from "react";
import Link from "next/link";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Col, Dropdown, Row } from "antd";
import { useRouter } from "next/router";

import {
  deleteLicenseAction,
  getLicenseListAction,
  isEditLicenseAction,
  onSearchLicenseTypingAction,
  selectedLicenseAction,
} from "~/store/licenses/action";
import { defaultPagination } from "~/utils/constants";

import Table from "../Table/Table";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import CustomSearch from "../base/CustomSearch";
import ContentHeader from "../base/common/ContentHeader";
import CustomSelect from "../base/CustomSelect";

let timeout = setTimeout(function () {}, 0);

const LicenseList = (props) => {
  const isOnboarding = props.hasOwnProperty("onboarding");
  const dispatch = useDispatch();
  const router = useRouter();

  const { licenses, loadingLicense, companystates, loadingCompanyStates } =
    useSelector((state) => {
      return {
        licenses: state.licenses.listOfLicenses.list,
        loadingLicense: state.licenses.listOfLicenses.loading,
        companystates: state.licenseStates.statesPerCompany.data,
        loadingCompanyStates: state.licenseStates.statesPerCompany.loading,
      };
    }, shallowEqual);

  const { stateId, search, sortBy, order, limit } = useSelector(
    (state) => state.licenses.listOfLicenses,
    shallowEqual
  );

  const [isDelete, setIsDelete] = useState({
    open: false,
    licenseToDelete: null,
    onProgress: false,
  });
  const [selectedStateCount, setSelectedStateCount] = useState(0);
  const defaultColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "15%",
      sorter: {},
      clickable: true,
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: {},
      clickable: true,
    },
    {
      title: "License",
      dataIndex: "license",
      key: "license",
      sorter: {},
      clickable: true,
    },
    {
      title: isOnboarding ? "Created" : "Updated",
      dataIndex: isOnboarding ? "created_at" : "updated_at",
      key: isOnboarding ? "created_at" : "updated_at",
      sorter: {},
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
                href={`/my-state-licenses/edit/${props.id}`}
                className="flex items-center justify-between"
                style={{ marginBottom: "3px" }}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(selectedLicenseAction(props));
                  router.push(`/my-state-licenses/view/${props.id}`);
                }}
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
                href={`/my-state-licenses/edit/${props.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(isEditLicenseAction(true));
                  dispatch(selectedLicenseAction(props));
                  router.push(`/my-state-licenses/edit/${props.id}`);
                }}
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
                    licenseToDelete: props.id,
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
        return (
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
                style={{ cursor: "pointer" }}
              />
            </div>
          </Dropdown>
        );
      },
    },
  ].filter((col) => {
    if (isOnboarding) {
      return col.key !== "x";
    }
    return col;
  });

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

            if (isOnboarding) return;

            dispatch(selectedLicenseAction(record));
            router.push(`/my-state-licenses/view/${record.id}`);
          },
        }),
      };
    }
    return col;
  });

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      getLicenseListAction({
        page: pagination.current,
        limit: pagination.pageSize,
        stateId,
        search,
        sortBy: Object.keys(sorter).length ? sorter.field : "updated_at",
        order: sorter.order === "ascend" ? "asc" : "desc",
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
    dispatch(onSearchLicenseTypingAction(e.target.value));

    timeout = setTimeout(() => {
      dispatch(
        getLicenseListAction({
          page: 1,
          limit,
          search: e.target.value,
          stateId,
          sortBy,
          order,
        })
      );
    }, 1000);
  };

  /**
   * On state selection
   * @param {value} value
   */
  const handleStateChange = (values) => {
    const mapped = values.map((val) => val.key);
    setSelectedStateCount(mapped.length);
    dispatch(
      getLicenseListAction({
        page: 1,
        limit: defaultPagination.pageSize,
        stateId: mapped,
        search,
        sortBy,
        order,
      })
    );
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
        licenseToDelete: null,
      });
    } else if (typeOfAction === "confirm") {
      setIsDelete({
        ...isDelete,
        onProgress: true,
      });
      const response = await dispatch(
        deleteLicenseAction(isDelete.licenseToDelete)
      );

      if (response) {
        setIsDelete({
          open: false,
          licenseToDelete: null,
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

  const renderTable = () => {
    return (
      <div id="_my-state-licenses-container_">
        <Table
          rowClassName="cursor-pointer"
          columns={columns}
          dataSource={Object.keys(licenses).length > 0 ? licenses.data : []}
          onChange={onChange}
          pagination={{
            defaultPageSize: defaultPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: defaultPagination.pageOptions,
            total: Object.keys(licenses).length > 0 ? licenses.total : 0,
            current: Object.keys(licenses).length > 0 ? licenses.page : 1,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
          scroll={{ x: 1280 }}
          loading={loadingLicense}
        />
      </div>
    );
  };

  return (
    <div
      className={`${
        isOnboarding
          ? licenses.hasOwnProperty("data") && licenses.data.length > 0
            ? "pb-1"
            : ""
          : "pb-16"
      } `}
    >
      {!isOnboarding && (
        <>
          <ContentHeader
            title={"My State Licenses"}
            hasAddBtn
            addBtnLabel={"Add a State License"}
            addBtnRoute={"/my-state-licenses/add"}
          />
          <Row className="flex md:justify-between flex-col md:flex-row mt-10 mb-5">
            <Col lg={12} className="flex gap-3 flex-col md:flex-row">
              <div className="w-full md:max-w-[174px]">
                <CustomSearch
                  onChange={handleOnSearch}
                  placeholder="License"
                  className="w-full"
                />
              </div>
              <div className="w-full md:max-w-[250px]">
                <CustomSelect
                  isMulti={true}
                  withsearch="true"
                  selectedcount={selectedStateCount}
                  statesearch="true"
                  placeholder="State"
                  options={companystates}
                  disabled={loadingCompanyStates}
                  name="state"
                  onChange={handleStateChange}
                  className="font-sharp-sans"
                />
              </div>
            </Col>
          </Row>
        </>
      )}

      <div id="_my-state-licenses-container_">
        {isOnboarding
          ? licenses.hasOwnProperty("data") && licenses.data.length > 0
            ? renderTable()
            : null
          : renderTable()}
      </div>

      <ConfirmDeleteModal
        title="You are about to delete a license"
        subtitle="Are you sure that you want to delete this license?"
        handleDelete={() => footerOnAction("confirm")}
        handleCancel={() => footerOnAction("cancel")}
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
      />
    </div>
  );
};

export default LicenseList;
