import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { dateTimeFormat } from "~/plugins/dateTimeFormat";
import { Col, Row, Skeleton, Grid, Dropdown } from "antd";
import DeleteButton from "../base/buttons/DeleteButton";
import ConfirmDeleteModal from "../base/modal/ConfirmDeleteModal";
import { deleteUserAction } from "~/store/users/action";
import { useRouter } from "next/router";
import BackButton from "../base/buttons/BackButton";
import config from "~/config";
import ContentHeader from "../base/common/ContentHeader";
import userTypeEnum from "~/enums/userTypes";
import CustomButton from "../base/CustomButton";
import { uplistApi } from "~/utils/api-handler";
import { UI } from "~/store/ui/type";
import userStatus from "~/enums/userStatus";
import {
  deleteLicenseAction,
  getLicensesByUser,
} from "~/store/licenses/action";
import { defaultPagination } from "~/utils/constants";
import Table from "../Table/Table";
import { isEmpty, isEqual } from "lodash";
import { USERS } from "~/store/users/type";
import UpdateUserLicenseModal from "../AddUser/UpdateUserLicenseModal";
import AddLicenseComponent from "../state-license/AddLicenseComponent";
import { getStatesPerCompanyAction } from "~/store/state/action";
import { LICENSES } from "~/store/licenses/type";
import CopyURLComponent from "../base/CopyURLComponent";

const UserDetails = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.users.updateUser, shallowEqual);
  const fromViewProfile = localStorage.getItem("viewProfile") === "true";
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;
  const [sendingInvitation, sendInvitation] = useState(false);

  const {
    user: userData,
    loadingLicense,
    licenses,
  } = useSelector((state) => {
    const { listOfLicenses, updateLicense } = state.licenses;

    return {
      user: state.auth.data,
      loadingLicense: listOfLicenses.loading,
      licenses: listOfLicenses.list,
    };
  }, shallowEqual);

  const [showLicenses, setShowLicenses] = useState(false);

  const [isDelete, setIsDelete] = useState({
    open: false,
    onProgress: false,
  });

  const [deletedUserLicense, deleteUserLicense] = useState({
    open: false,
    license: null,
    inProgress: false,
  });

  /**
   * Loading
   * @param {Object} loading
   * @returns {Boolean}
   */
  const onLoading = (loading) => {
    if (Object.keys(loading).length > 0) {
      return false;
    }
    return true;
  };

  const handleDeleteUser = async (u) => {
    setIsDelete({
      ...isDelete,
      onProgress: true,
    });
    const response = await dispatch(deleteUserAction(u));
    if (response) {
      setIsDelete({
        ...isDelete,
        open: false,
        onProgress: false,
      });
      setTimeout(() => {
        router.push("/users");
      }, 500);
    } else {
      setIsDelete({
        ...isDelete,
        onProgress: false,
      });
    }
  };

  const authUser = (u) => {
    if (u && user.hasOwnProperty("id")) {
      if (Number(u.user_type_id) !== userTypeEnum.LOAN_OFFICER) {
        if (u.id !== user.id) {
          return (
            <DeleteButton
              {...(isMobile ? { isfullwidth: true } : {})}
              onClick={() => {
                setIsDelete({
                  ...isDelete,
                  open: true,
                });
              }}
            />
          );
        }
      }
    }
  };

  const resendInvitation = async () => {
    sendInvitation(true);

    const { data } = await uplistApi.post(
      `/api/resend-invitation-email/${user.id}`
    );

    if (data.message) {
      dispatch({
        type: UI.snackbars,
        payload: {
          open: true,
          message: data.message,
          position: "topRight",
          type: "success",
        },
      });
    }

    sendInvitation(false);
  };

  const enableResendInvitation = () => {
    return (
      user.first_time_login &&
      [userStatus.ACTIVE, userStatus.ACTIVE_TRIAL].includes(user.user_status.id)
    );
  };

  useEffect(() => {
    if (!user.id || !userData.user?.id) return;
    setShowLicenses(!isEqual(userData.user.id, user.id));
    dispatch(getStatesPerCompanyAction(user.company.id));

    getLicensesByUser(
      user.id,
      1,
      defaultPagination.pageSize,
      "",
      "",
      "updated_at",
      "desc"
    );
  }, [user, userData]);

  useEffect(() => {
    dispatch({
      type: LICENSES.listOfLicenses,
      payload: {
        list: {},
        loading: true,
        page: 1,
        limit: defaultPagination.pageSize,
        search: "",
        stateId: "",
        sortBy: "",
        order: "",
      },
    });
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "15%",
      sorter: {},
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: {},
    },
    {
      title: "License",
      dataIndex: "license",
      key: "license",
      sorter: {},
    },
    {
      title: "Updated",
      dataIndex: "updated_at",
      key: "updated_at",
      sorter: {},
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
              <div
                className="flex gap-3 mt-1"
                onClick={() =>
                  dispatch({
                    type: USERS.updateUserLicense,
                    payload: {
                      openModal: true,
                      license: props,
                    },
                  })
                }
              >
                <span className="w-4">
                  <img
                    src={`${window.location.origin}/icon/editIcon.png`}
                    alt="edit-icon"
                  />
                </span>
                Edit
              </div>
            ),
          },
          {
            key: "2",
            label: (
              <div
                className="flex gap-3 mt-1"
                onClick={() =>
                  deleteUserLicense({
                    open: true,
                    license: props,
                  })
                }
              >
                <span className="w-4">
                  <img
                    src={`${window.location.origin}/icon/deleteIcon.png`}
                    alt="delete-icon"
                  />
                </span>
                Delete
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
  ];

  const confirmDeleteActionButton = async (typeOfAction) => {
    if (isEqual(typeOfAction, "cancel")) {
      deleteUserLicense({ open: false, license: null });
      return;
    }
    deleteUserLicense({ ...deletedUserLicense, inProgress: true });
    await dispatch(deleteLicenseAction(deletedUserLicense.license.id));
    deleteUserLicense({ open: false, license: null, inProgress: false });
  };

  const onChange = (pagination, filters, sorter, extra) => {
    getLicensesByUser(
      user.id,
      pagination.current,
      pagination.pageSize,
      "",
      "",
      isEmpty(sorter) ? "updated_at" : sorter.field,
      isEqual(sorter.order, "ascend") ? "asc" : "desc"
    );
  };

  return (
    <Row>
      <Col sm={24} md={24} lg={24} className="mb-3">
        {!fromViewProfile && (
          <BackButton handleBack={() => window.history.back()} />
        )}
      </Col>
      <Col sm={24} md={24} lg={24}>
        <ContentHeader
          title={"User Details"}
          hasUpdateBtn
          updateBtnRoute={`/users/edit/${user.id}`}
          customDeleteBtn={authUser(userData.user)}
        />
        <div className="w-full border border-solid rounded-3xl border-alice-blue p-8 my-10">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="flex-1 w-full">
              <div className="flex flex-col lg:flex-row justify-start items-start w-full pb-5 md:pb-8 gap-5">
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    ID
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      user.employee_id
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    First Name
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      user.first_name
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Last Name
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      user.last_name
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Created On
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      dateTimeFormat(user.created_at, "MM DD YYYY")
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row justify-start items-start w-full pb-5 md:pb-8 gap-5">
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Company
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.company == undefined ? (
                      user.company_name
                    ) : (
                      user.company.name
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Price Engine
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.pricing_engine.name === undefined ? (
                      user.pricing_engine
                    ) : (
                      user.pricing_engine.name
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Job Title
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1`}
                  >
                    {user.job_title ? user.job_title : "-"}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    User Type
                  </div>
                  <div className="user-details-value text-base font-sharp-sans-medium text-neutral-1">
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.user_type == undefined ? (
                      user.user_type_name
                    ) : (
                      user.user_type.name
                        .replace(/_/g, " ")
                        .replace(
                          /\w\S*/g,
                          (txt) =>
                            txt.charAt(0).toUpperCase() +
                            txt.substr(1).toLowerCase()
                        )
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row  justify-start items-start w-full lg:pb-8 gap-5">
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Mobile Number
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.mobile_number ? (
                      user.mobile_number
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Email Address
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1 break-all`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      user.email
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Alternate Email
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.alternative_email ? (
                      user.alternative_email
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2"></div>
              </div>

              <div className="flex flex-col lg:flex-row justify-start items-start w-full lg:pb-8 gap-5">
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    NMLS Number
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.nmls_num ? (
                      user.nmls_num
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    User URL Identifier
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } text-base font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : (
                      user.url_identifier
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    User Status
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.user_status == undefined ? (
                      user.user_status_desc
                    ) : (
                      user.user_status.description
                    )}
                  </div>
                </div>
                <div className="flex-1 w-full lg:w-1/4 mb-2"></div>
              </div>

              <div className="flex flex-col lg:flex-row justify-start items-start w-full gap-5">
                <div className="flex-1 w-full lg:w-1/4 mb-2">
                  <div className="user-details-header font-sharp-sans-medium text-neutral-3">
                    Custom logo{" "}
                    <span style={{ fontSize: "11px" }}>
                      (Show this logo when you generate listings and flyers)
                    </span>
                  </div>
                  <div
                    className={`${
                      onLoading(user) ? "onloading" : "user-details-value"
                    } font-sharp-sans-medium text-neutral-1`}
                  >
                    {onLoading(user) ? (
                      <Skeleton paragraph={{ rows: 0 }} />
                    ) : user.custom_logo_flyers ? (
                      <div>
                        <img
                          src={`${config.storagePath}${user.custom_logo_flyers} `}
                          alt="custom logo"
                          style={{
                            width: "auto",
                            objectFit: "contain",
                            height: "auto",
                            maxHeight: "80px",
                            maxWidth: "150px",
                          }}
                        />
                      </div>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>
                {showLicenses && user?.nmls_num && (
                  <CopyURLComponent
                    containerClassName="lg:w-1/4 mb-2"
                    label="Public Quick Quote URL"
                    url={
                      onLoading(user)
                        ? null
                        : `${config?.appUrl}/${user?.company?.code}/quick-quote/${user?.nmls_num}-${user?.url_identifier}`
                    }
                    isLoading={onLoading(user)}
                  />
                )}
                {showLicenses && user?.nmls_num && (
                  <CopyURLComponent
                    containerClassName="lg:w-1/4 mb-2"
                    label="Agent Listing input URL"
                    url={
                      onLoading(user)
                        ? null
                        : `${config?.appUrl}/${user?.company?.code}/agent-listing/${user?.nmls_num}-${user?.url_identifier}`
                    }
                    isLoading={onLoading(user)}
                  />
                )}
                <div className="flex-1 w-full lg:w-1/4 mb-2"></div>
              </div>
            </div>
          </div>
          {enableResendInvitation() ? (
            <CustomButton
              className="mt-8 w-[182px]"
              onClick={resendInvitation}
              isloading={sendingInvitation.toString()}
              label="Resend Invitation"
            />
          ) : (
            ""
          )}
        </div>
        <UpdateUserLicenseModal />
        <ConfirmDeleteModal
          title="You are about to delete a user"
          subtitle="Flyers associated with this user will be automatically archived."
          handleDelete={() => handleDeleteUser(user)}
          handleCancel={() => setIsDelete({ ...isDelete, open: false })}
          openModal={isDelete.open}
          onProgress={isDelete.onProgress}
        />
        <ConfirmDeleteModal
          title="You are about to delete a license"
          subtitle="Are you sure that you want to delete this license?"
          handleDelete={() => confirmDeleteActionButton("confirm")}
          handleCancel={() => confirmDeleteActionButton("cancel")}
          openModal={deletedUserLicense.open}
          onProgress={deletedUserLicense.inProgress}
        />
      </Col>
      {showLicenses && (
        <Col sm={24} md={24} lg={24}>
          <ContentHeader title="Licenses" />
          <AddLicenseComponent
            user={user}
            showBackButton={false}
            showCancelButton={false}
            showContentHeader={false}
            alignActionButtonCenter
          />
          <div id="_my-state-licenses-container_" className="mb-10">
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
              scroll={{ x: 910 }}
              loading={loadingLicense}
            />
          </div>
        </Col>
      )}
    </Row>
  );
};

export default UserDetails;
