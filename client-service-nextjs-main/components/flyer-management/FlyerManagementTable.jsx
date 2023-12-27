import React, { useState } from "react";
import { Col, Dropdown, Row, Tooltip } from "antd";
import Link from "next/link";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import Table from "../Table/Table";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import CustomSearch from "../base/CustomSearch";
import { FLYERS } from "~/store/flyers/type";
import { downloadFlyerAction, viewAllFlyers } from "~/store/flyers/action";
import { onHandleError } from "~/error/onHandleError";
import { deleteFlyerAPI } from "~/store/flyers/api";
import DownloadModal from "../base/modal/DownloadModal";
import config from "~/config";
import { DownloadIcon } from "~/icons/icon";
import CustomSelect from "../base/CustomSelect";
import Select from "../Select/Select";
import { getFullUserListAction } from "~/store/users/action";
import userTypes from "~/enums/userTypes";
import { defaultPagination } from "~/utils/constants";

const controller = new AbortController();
const { signal } = controller;
let timeout = setTimeout(function () {}, 0);
const FlyerManagementTable = () => {
  const dispatch = useDispatch();

  const { flyers, listOfCreatedBy, companyList } = useSelector((state) => {
    return {
      flyers: state.flyers.listOfFlyers,
      listOfCreatedBy: state.flyers.listOfCreatedBy,
      companyList: state.company.companyList.company,
    };
  }, shallowEqual);

  const user = useSelector((state) => state.auth.data, shallowEqual);

  const [flyersDownload, setFlyersDownload] = useState({
    open: false,
    progress: 0,
    onRequested: false,
  });
  const [selectedCreatedByCount, setSelectedCreatedByCount] = useState(0);
  const [isDelete, setIsDelete] = useState({
    open: false,
    flyers: null,
    onProgress: false,
  });

  const defaultColumns = [
    {
      title: "MLS Number",
      dataIndex: "mls_number",
      key: "mls_number",
      sorter: {},
      ellipsis: true,
      width: "15%",
      clickable: true,
    },
    {
      title: "Flyer File Name",
      dataIndex: "generated_flyer",
      key: "generated_flyer",
      sorter: {},
      ellipsis: true,
      clickable: true,
      render: (generatedFlyer) => {
        const modifiedFileName = generatedFlyer.replace("generated_pdf/", "");
        return (
          <Tooltip placement="bottomLeft" title={modifiedFileName}>
            {modifiedFileName}
          </Tooltip>
        );
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      sorter: {},
      ellipsis: true,
      clickable: true,
      render: (props) => {
        return (
          <Tooltip placement="bottomLeft" title={props}>
            {props}
          </Tooltip>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      sorter: {},
      clickable: true,
      ellipsis: true,
    },
    {
      title: "Date Generated",
      dataIndex: "created_at",
      key: "created_at",
      sorter: {},
      clickable: true,
      ellipsis: true,
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
                href={props.pdf_link}
                className="flex items-center justify-between mb-1"
                target="_blank"
                rel="noopener noreferrer"
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
                className="flex items-center"
                href={`${config.storagePath}${props.generated_flyer}`}
                onClick={async (event) => {
                  event.preventDefault();

                  setFlyersDownload({
                    ...flyersDownload,
                    open: true,
                  });

                  downloadFlyer(props.generated_flyer, props.generated_flyer);
                }}
              >
                <DownloadIcon fill="#7E8C9C" />
                <span
                  style={{ flex: 1, marginLeft: "10px" }}
                  className="text-neutral-2"
                >
                  Download
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
                    flyers: props.generated_flyer_id,
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
                  Archive
                </div>
              </div>
            ),
          },
        ].filter((item) => {
          if (flyers.activeArchive === "archive") {
            return item.key !== "3";
          }
          return item;
        });
        return (
          <Dropdown
            menu={{ items }}
            trigger={["click"]}
            arrow={true}
            type="default"
            size="medium"
            placement="bottomRight"
          >
            <div>
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

  if (Number(user?.user?.user_type_id) === userTypes.UPLIST_ADMIN) {
    const companyObj = {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      sorter: {},
      ellipsis: true,
      width: "15%",
      clickable: true,
    };

    defaultColumns.splice(3, 0, companyObj);
  }

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
            window.open(`${config.storagePath}${record.generated_flyer}`);
          },
        }),
      };
    }
    return col;
  });

  /**
   * Download flyer
   * @param {string} fileName
   * @param {string} flyerId
   * @returns {void}
   */
  const downloadFlyer = async (fileName, flyerId) => {
    const modifiedFileName = fileName.replace("generated_pdf/", "");
    dispatch(
      downloadFlyerAction({
        fileName: `${modifiedFileName}.pdf`,
        flyerId,
        flyersDownload,
        setFlyersDownload,
        signal,
      })
    );
  };

  /**
   * Hangdle on search address
   * @param {Event} e
   * @returns {void}
   */
  const handleOnSearchAddress = (e) => {
    clearTimeout(timeout);
    dispatch({
      type: FLYERS.ON_SEARCH,
    });

    timeout = setTimeout(() => {
      dispatch(
        viewAllFlyers({
          page: 1,
          limit: flyers.limit,
          sortBy: flyers.sortBy,
          search: flyers.search,
          addressSearch: e.target.value,
          activeArchive: flyers.activeArchive,
          created_by: flyers.created_by,
          companyId: flyers.companyId,
        })
      );
    }, 1000);
  };

  /**
   * Hangdle on search
   * @param {Event} e
   * @returns {void}
   */
  const handleOnSearch = (e) => {
    clearTimeout(timeout);
    dispatch({
      type: FLYERS.ON_SEARCH,
    });

    timeout = setTimeout(() => {
      dispatch(
        viewAllFlyers({
          page: 1,
          limit: flyers.limit,
          sortBy: flyers.sortBy,
          search: e.target.value,
          addressSearch: flyers.addressSearch,
          activeArchive: flyers.activeArchive,
          created_by: flyers.created_by,
          companyId: flyers.companyId,
        })
      );
    }, 1000);
  };

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      viewAllFlyers({
        page: pagination.current,
        limit: pagination.pageSize,
        sortBy: sorter.order
          ? encodeURIComponent(
              JSON.stringify({
                [sorter.field === "created_at"
                  ? "generated_flyer_created_at"
                  : sorter.field === "createdBy"
                  ? "first_name"
                  : sorter.field]: sorter.order === "ascend" ? "ASC" : "DESC",
              })
            )
          : "",
        search: flyers.search,
        addressSearch: flyers.addressSearch,
        activeArchive: flyers.activeArchive,
        created_by: flyers.created_by,
        companyId: flyers.companyId,
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
        ...isDelete,
        open: false,
        flyers: null,
        onProgress: false,
      });
    } else if (typeOfAction === "confirm") {
      setIsDelete({
        ...isDelete,
        onProgress: true,
      });

      try {
        const response = await deleteFlyerAPI(isDelete.flyers, signal);
        if (response.status === 200) {
          setIsDelete({
            ...isDelete,
            open: false,
            flyers: null,
            onProgress: false,
          });
          dispatch(
            viewAllFlyers({
              page: 1,
              limit: defaultPagination.pageSize,
              sortBy: "",
              search: "",
              addressSearch: "",
              activeArchive: "active",
              created_by: "",
              companyId: null,
            })
          );
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: "Flyer was archived.",
              description: "",
              position: "topRight",
              type: "success",
            },
          });
        }
      } catch (error) {
        onHandleError(error, dispatch);
        setIsDelete({
          ...isDelete,
          open: false,
          flyers: null,
          onProgress: false,
        });
      }
    }
  };

  return (
    <div className="pb-16">
      <Row className="flex flex-col lg:flex-row mt-10 mb-5">
        <div className="flex-1 flex lg:justify-start flex-col md:flex-row gap-4 w-full">
          <CustomSearch
            onChange={handleOnSearch}
            placeholder="MLS No."
            className="w-full md:w-52"
          />

          {user.isAuthenticated &&
            user.user &&
            [userTypes.UPLIST_ADMIN].includes(
              Number(user.user.user_type_id)
            ) && (
              <div className="w-full sm:w-full md:w-52">
                <CustomSelect
                  options={companyList}
                  name="company"
                  placeholder="Company"
                  withsearch="true"
                  disabled={!companyList.length}
                  onChange={(opt) => {
                    dispatch(getFullUserListAction(opt?.value));
                    dispatch(
                      viewAllFlyers({
                        page: 1,
                        limit: flyers.limit,
                        sortBy: flyers.sortBy,
                        search: flyers.search,
                        addressSearch: flyers.addressSearch,
                        activeArchive: flyers.activeArchive,
                        created_by: flyers.created_by,
                        companyId: opt?.value,
                      })
                    );
                  }}
                />
              </div>
            )}

          {user.isAuthenticated &&
            user.user &&
            [userTypes.UPLIST_ADMIN, userTypes.COMPANY_ADMIN].includes(
              Number(user.user.user_type_id)
            ) && (
              <div className="w-full sm:w-full md:w-52">
                <CustomSelect
                  options={listOfCreatedBy}
                  name="created_by"
                  placeholder="Created By"
                  disabled={!listOfCreatedBy.length}
                  isMulti={true}
                  selectedcount={selectedCreatedByCount}
                  withsearch="true"
                  onChange={(filter) => {
                    const reqArr = filter.map((item) => {
                      return {
                        first_name: item?.first_name,
                        last_name: item?.last_name,
                      };
                    });

                    setSelectedCreatedByCount(reqArr.length);
                    dispatch(
                      viewAllFlyers({
                        page: 1,
                        limit: flyers.limit,
                        sortBy: flyers.sortBy,
                        search: flyers.search,
                        addressSearch: flyers.addressSearch,
                        activeArchive: flyers.activeArchive,
                        companyId: flyers.companyId,
                        created_by:
                          reqArr.length > 0
                            ? encodeURIComponent(JSON.stringify(reqArr))
                            : "",
                      })
                    );
                  }}
                />
              </div>
            )}

          <CustomSearch
            onChange={handleOnSearchAddress}
            placeholder="Address"
            className="w-full md:w-52"
          />
        </div>
      </Row>

      <Col id="_flyer-management-container_">
        <Table
          rowClassName="cursor-pointer"
          columns={columns}
          dataSource={
            Object.keys(flyers.data).length > 0 ? flyers.data.data : []
          }
          onChange={onChange}
          pagination={{
            defaultPageSize: defaultPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: defaultPagination.pageOptions,
            total: Object.keys(flyers.data).length > 0 ? flyers.data.total : 0,
            current:
              Object.keys(flyers.data).length > 0
                ? flyers.data.current_page
                : 1,
            showTotal: (total, range) => {
              return `Showing ${range[0]} to ${range[1]} of ${total} entries`;
            },
          }}
          scroll={{ x: 1280 }}
          loading={flyers.loading}
        />
      </Col>
      <ConfirmDeleteModal
        title="You are about to archive a flyer"
        subtitle="Are you sure that you want to archive this flyer?"
        handleDelete={() => footerOnAction("confirm")}
        handleCancel={() => footerOnAction("cancel")}
        openModal={isDelete.open}
        onProgress={isDelete.onProgress}
        buttonTitle="Archive"
      />
      <DownloadModal
        name="flyers"
        open={flyersDownload.open}
        progress={flyersDownload.progress}
        onCancel={() => {
          if (flyersDownload.onRequested) return;

          setFlyersDownload({
            ...flyersDownload,
            open: false,
            progress: 0,
            onRequested: false,
          });

          controller.abort();
        }}
      />
    </div>
  );
};

export default FlyerManagementTable;
