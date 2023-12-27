import React, { useEffect, useState, useRef } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Form, Row, Space, Button, Col } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import config from "~/config";
import { onHandleError } from "~/error/onHandleError";
import {
  getCompanyStrategyAction,
  getDefaultStrategyPerCompanyAction,
  getOBLatestStrategiesAction,
  getOBUserStrategiesAction,
  onSearchOBValuesAction,
  resetCompanyStrategy,
  selectMassUsersAction,
  selectUserStrategyAction,
  selectedCompanyAction,
  showMassUpdateModalAction,
  upsertDefaultStrategyAction,
} from "~/store/pricingEngine/optimalBlue/action";
import {
  backForwardToPage,
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
} from "~/store/ui/action";
import { completeOnboardingAction } from "~/store/users/action";
import { defaultPagination } from "~/utils/constants";
import userTypesEnum from "~/enums/userTypes";

import CustomDivider from "../base/CustomDivider";
import CustomSearch from "../base/CustomSearch";
import CustomButton from "../base/CustomButton";
import CustomFormItem from "../base/CustomFormItem";
import CustomInputNumber from "../base/CustomInputNumber";
import MassUpdateStretegyModal from "./MassUpdateStrategyComponent";
import Table from "../Table/Table";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import CustomSelect from "../base/CustomSelect";

let timeout = setTimeout(function () {}, 0);

const StrategiesComponent = (props) => {
  const isOnboarding = props.hasOwnProperty("onboarding");
  const confirmRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originatorList, setOriginatorList] = useState([]);

  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const defaultText = "-- default --";

  const {
    loadingDefaultStrategy,
    defaultStrategy,
    companyAccountId,
    strategyList,
    strategyOptions,
    loadingStrategy,
    massDataToUpdate,
    userTypes,
    formChange: { isChange, isModalOpen, url },
    userData,
    companyList,
    selectedCompanyId,
  } = useSelector((state) => {
    return {
      loadingDefaultStrategy: state.optimalBlue.companyDefaultStrategy.loading,
      defaultStrategy: state.optimalBlue.companyDefaultStrategy.data,
      companyAccountId: state.optimalBlue.companyStrategy.company_account_id,
      strategyList: state.optimalBlue.companyStrategy.list,
      strategyOptions: state.optimalBlue.companyStrategy.options,
      loadingStrategy: state.optimalBlue.companyStrategy.loading,
      massDataToUpdate: state.optimalBlue.massUpdateUserStrategy.dataToUpdate,
      userTypes: state.auth.userTypes.data,
      formChange: state.ui.formChange,
      userData: state.auth.data.user,
      companyList: state.company.companyList.company,
      selectedCompanyId: state.optimalBlue.companyId,
    };
  }, shallowEqual);

  const { stepper } = useSelector((state) => {
    return {
      stepper: state.ui.stepper,
    };
  }, shallowEqual);

  const { search, searchUserType, sortBy, order, limit, page, total } =
    useSelector((state) => state.optimalBlue.companyStrategy, shallowEqual);

  const hasAdminAccess = [userTypesEnum.UPLIST_ADMIN].includes(
    Number(userData.user_type_id)
  );

  const isUplistAdmin = userData.user_type_id === userTypesEnum.UPLIST_ADMIN;

  useEffect(() => {
    if (
      !loadingDefaultStrategy &&
      Object.keys(defaultStrategy).length &&
      strategyOptions.length
    ) {
      const selected = strategyOptions.filter(
        (strat) => strat.value === defaultStrategy.business_channel_id
      );

      if (selected.length) {
        setOriginatorList(selected[0].originators);

        const selectedOriginator = selected[0].originators.filter(
          (sel) => sel.key === defaultStrategy.originator_id
        );

        const formatted = {
          ...defaultStrategy,
          business_channel_id: {
            label: selected[0].label,
            value: selected[0].value,
          },
          originator_id: {
            label: selectedOriginator[0].label,
            value: selectedOriginator[0].value,
          },
        };

        for (const key in formatted) {
          form.setFields([
            {
              name: `${key}`,
              value: formatted[key],
              label: formatted[key],
            },
          ]);

          if (isOnboarding) {
            if (
              !(
                formatted[key] === "" ||
                formatted[key] === null ||
                formatted[key] === undefined
              )
            ) {
              confirmRef.current.disabled = true;
            }
          }
        }
      }
    }
  }, [defaultStrategy, strategyOptions, props]);

  const resetForm = () => {
    setOriginatorList([]);
    form.resetFields(["business_channel_id", "originator_id", "price"]);
  };

  useEffect(() => {
    if (isUplistAdmin) {
      resetForm();
    }
  }, []);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: {},
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: {},
      ellipsis: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      sorter: {},
    },
    {
      title: "Business Channel",
      dataIndex: "business_channel",
      key: "business_channel",
      render: (record) => {
        return <div>{record ?? defaultText}</div>;
      },
    },
    {
      title: "Originator",
      dataIndex: "originator",
      key: "originator",
      render: (record) => {
        return <div>{record ?? defaultText}</div>;
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (record) => {
        return <div>{record ?? defaultText}</div>;
      },
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      width: "4%",
      fixed: "right",
      render: (props) => {
        const hasStrategy = props.optimalBlueStrategy;
        const id = hasStrategy ? props.optimalBlueStrategy.id : props.userId;
        const mode = hasStrategy ? "edit" : "add";

        return (
          <Space size="middle">
            <a
              onClick={(e) => {
                e.preventDefault();
                dispatch(
                  selectUserStrategyAction(props.optimalBlueStrategy, mode, id)
                );
                dispatch(showMassUpdateModalAction(true, "single"));
              }}
            >
              <img
                src={`${window.location.origin}/icon/editIcon.png`}
                alt="edit-icon"
              />
            </a>
            {/* <Link
              href={`/management/price-engine-ob/${slug}/${id}`}
              onClick={(e) => {
                e.preventDefault();
                dispatch(selectUserStrategyAction(props.optimalBlueStrategy));
                router.push(`/management/price-engine-ob/${slug}/${id}`);
              }}
            >
              <img
                src={`${window.location.origin}/icon/editIcon.png`}
                alt="edit-icon"
              />
            </Link> */}
          </Space>
        );
      },
    },
  ];

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

  const onPropagation = (change, open, isURL) => {
    dispatch(formDialogAlert(change, open, isURL));
  };

  const handleFinish = async (values) => {
    if (isUplistAdmin && !selectedCompanyId) {
      snackBar("Please select a company.", "", "error");
      return;
    }
    setIsLoading(true);
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const newValues = {
        ...values,
        business_channel_id: values.business_channel_id.value,
        originator_id: values.originator_id.value,
        company_account_id: companyAccountId,
        company_id: isUplistAdmin ? selectedCompanyId : userData.company_id,
      };

      const response = await upsertDefaultStrategyAction(newValues, signal);

      if (response.status === 200) {
        snackBar(response.data.message, "", "success");
        setIsLoading(false);
        onPropagation(false, false, "");
        formChangeRemove();
      }
    } catch (error) {
      onPropagation(false, false, "");
      formChangeRemove();
      onHandleError(error, dispatch);
      setIsLoading(false);
    }
  };

  const handleGetLatestStrategy = () => {
    if (isUplistAdmin && !selectedCompanyId) {
      snackBar("Please select a company.", "", "error");
      return;
    }
    dispatch(getOBLatestStrategiesAction());
  };

  const handleOnSearch = (e) => {
    clearTimeout(timeout);
    dispatch(onSearchOBValuesAction(e.target.value));

    timeout = setTimeout(() => {
      dispatch(
        getOBUserStrategiesAction({
          page: 1,
          limit,
          search: e.target.value,
          searchUserType,
          sortBy,
          order,
        })
      );
    }, 1000);
  };

  const handleOnChange = (value) => {
    dispatch(
      getOBUserStrategiesAction({
        page,
        limit,
        search,
        searchUserType: value ?? "",
        sortBy,
        order,
      })
    );
  };

  const handleCompanyChange = (value) => {
    resetForm();

    if (value) {
      dispatch(
        resetCompanyStrategy({
          search: search,
          searchUserType: searchUserType,
        })
      );
      dispatch(selectedCompanyAction(value));
      dispatch(getDefaultStrategyPerCompanyAction());
      dispatch(getCompanyStrategyAction());
    } else {
      dispatch(resetCompanyStrategy());
    }
  };

  const handleDataSelection = (selectedRows) => {
    const newKeysArray = [];

    selectedRows.forEach((row) => {
      const index = massDataToUpdate.indexOf(row.key);
      if (index === -1) {
        newKeysArray.push(row.key);
      } else {
        massDataToUpdate.splice(index, 1);
      }
    });

    const joinedArray = [...massDataToUpdate, ...newKeysArray];

    // dispatch all data
    dispatch(selectMassUsersAction(joinedArray));
  };

  const onChange = (pagination, filters, sorter, extra) => {
    dispatch(
      getOBUserStrategiesAction({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
        searchUserType,
        sortBy: Object.keys(sorter).length ? sorter.field : "name",
        order: sorter.order === "ascend" ? "asc" : "desc",
      })
    );
  };

  const handleSelectBusinessChannel = (value) => {
    setOriginatorList([]);
    form.resetFields(["originator_id"]);
    const selected = strategyOptions.filter((strat) => strat.value === value);
    if (selected.length) {
      setOriginatorList(selected[0].originators);
    }
  };

  return (
    <div className="pb-16">
      {!isOnboarding && (
        <>
          <Row className="flex justify-between items-center mb-3">
            <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl">
              {"Price Engine (Optimal Blue)"}
            </h2>
          </Row>
          <CustomDivider />
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} xl={12}>
              {hasAdminAccess && (
                <div className="w-full my-5">
                  <p className="font-sharp-sans-bold mb-1 mt-0 text-neutral-2 text-base">
                    Company
                  </p>
                  <CustomSelect
                    options={companyList}
                    name="company"
                    placeholder="Select company"
                    withsearch="true"
                    disabled={!companyList.length}
                    onChange={(opt) => handleCompanyChange(opt?.value)}
                  />
                </div>
              )}
            </Col>
          </Row>
        </>
      )}

      {/* STRATEGIES */}
      <div className="mt-10">
        <h2
          className={`font-sharp-sans-bold text-2xl ${
            isOnboarding && "text-center"
          }`}
        >
          Get Latest Strategies
        </h2>
        <p
          className={`font-sharp-sans-medium text-neutral-2 text-body-3 ${
            isOnboarding && "text-center"
          }`}
        >
          <span className="font-sharp-sans-semibold text-error">NOTE:</span>{" "}
          When you refresh and get latest strategies, if a previous strategy was
          set for the user and that strategy no longer exists, the{" "}
          <span style={{ borderBottom: "dashed 1px #4B5A6A" }}>
            default strategy specified below
          </span>{" "}
          will be used. You can always map a different strategy for the
          individual below.
        </p>
        <div className={`${isOnboarding && "text-center"}`}>
          <CustomButton
            label="Get Latest Strategies"
            onClick={handleGetLatestStrategy}
            disabled={isLoading}
            isloading={isLoading.toString()}
          />
        </div>
      </div>
      {/* DEFAULT STRATEGIES */}
      <div className="mt-10">
        <h2
          className={`font-sharp-sans-bold mt-0 text-2xl ${
            isOnboarding && "text-center"
          }`}
        >
          Set a “Default” Strategy{" "}
          <span className="text-base text-error">(Required)</span>
        </h2>
        <p
          className={`font-sharp-sans-medium text-neutral-2 text-body-3 ${
            isOnboarding && "text-center"
          }`}
        >
          <span className="font-sharp-sans-semibold text-error">NOTE:</span> If
          an Optimal Blue Strategy is not mapped for a user below, this strategy
          will be used by default for the loan officer to get rates on their
          listing pages.
        </p>
      </div>
      <div className="mt-5 mb-4">
        <Form
          form={form}
          onFinish={handleFinish}
          onFieldsChange={(changedValue, _) => {
            for (const value of changedValue) {
              if (value.touched) {
                if (!props.hasOwnProperty("onboarding")) {
                  /**
                   * Once only to dispatch the form change
                   * add or update
                   */
                  if (!isChange) {
                    onPropagation(true, false, "");
                  } else {
                    if (getChangeForm() === null) {
                      onPropagation(true, false, "");
                    }
                  }
                }
                break;
              }
            }
          }}
        >
          <div className="flex flex-col lg:flex-row justify-between lg:gap-4 items-end">
            <div className="flex flex-1 w-full flex-col md:flex-row justify-between md:gap-4">
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Default Business Channel"
                  name="business_channel_id"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    options={strategyOptions}
                    placeholder="Select Business Channel"
                    disabled={
                      !strategyOptions.length ||
                      loadingStrategy ||
                      loadingDefaultStrategy
                    }
                    onChange={(opt) => {
                      handleSelectBusinessChannel(opt?.value);
                    }}
                    withsearch="true"
                  />
                </CustomFormItem>
              </div>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Default Originator"
                  name="originator_id"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    options={originatorList}
                    placeholder="Select Originator"
                    disabled={
                      loadingStrategy ||
                      !originatorList.length ||
                      loadingDefaultStrategy
                    }
                    withsearch="true"
                  />
                </CustomFormItem>
              </div>
            </div>
            <div className="flex flex-1 w-full flex-col md:flex-row md:gap-4 md:items-end">
              <div className="md:flex-1 w-full">
                <CustomFormItem
                  label="Default Price"
                  name="price"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    type="currency"
                    disabled={
                      loadingStrategy ||
                      !originatorList.length ||
                      loadingDefaultStrategy
                    }
                    placeholder="Price"
                    maxnumber={config.ob_strategy.max_price}
                    min={config.ob_strategy.min_price}
                    precision={3}
                  />
                </CustomFormItem>
              </div>
              <div className="md:flex-1 w-full">
                <CustomButton
                  label="Set Default Values"
                  htmlType="submit"
                  className="mb-6"
                  disabled={isLoading || !originatorList.length}
                  isloading={isLoading.toString()}
                  isfullwidth
                />
              </div>
            </div>
          </div>
        </Form>
      </div>
      {/* TABLE SEARCH | ACTIONS */}
      <div className="flex flex-col lg:flex-row justify-between mb-5 gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5">
          <div className="w-full">
            <CustomSearch placeholder="Search" onChange={handleOnSearch} />
          </div>
          <div className="w-full">
            <CustomSelect
              options={userTypes}
              placeholder="Role"
              onChange={(opt) => handleOnChange(opt?.value)}
            />
          </div>
        </div>
        {massDataToUpdate.length ? (
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-end gap-5">
            <div>
              <span className="font-sharp-sans-medium text-neutral-3">
                {massDataToUpdate.length} users selected
              </span>
            </div>
            <div>
              <CustomButton
                label="Mass Update"
                onClick={() =>
                  dispatch(showMassUpdateModalAction(true, "mass"))
                }
                disabled={isLoading}
                isloading={isLoading.toString()}
                isfullwidth
              />
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div>
        <Table
          rowSelection={{
            onSelect: (record, selected, selectedRows) => {
              handleDataSelection([record]);
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              handleDataSelection(changeRows);
            },
            selectedRowKeys: massDataToUpdate,
            fixed: true,
          }}
          columns={columns}
          dataSource={strategyList}
          loading={loadingStrategy}
          onChange={onChange}
          scroll={{ x: 1280 }}
          pagination={{
            defaultPageSize: defaultPagination.pageSize,
            showSizeChanger: true,
            pageSizeOptions: defaultPagination.pageOptions,
            total: total,
            current: strategyList.length ? page : 1,
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
        />
      </div>

      {isOnboarding && (
        <>
          <div
            className={`flex flex-col lg:flex-row-reverse ${
              isOnboarding ? "justify-center pb-6" : "pb-16"
            }  items-center gap-4 mt-6 w-full`}
          >
            <Button
              className="update-add-user flex justify-between justify-items-center items-center bg-xanth text-neutral-1 font-sharp-sans-bold border-xanth w-full md:w-44 h-10"
              disabled={
                !strategyOptions.length ||
                loadingStrategy ||
                loadingDefaultStrategy ||
                !originatorList.length
              }
              ref={confirmRef}
              onClick={() => dispatch(completeOnboardingAction(false))}
            >
              Confirm
            </Button>

            <Button
              onClick={() => {
                dispatch(backForwardToPage(3, props));
              }}
              className="flex justify-between justify-items-center items-center bg-white text-neutral-1 font-sharp-sans-bold  border-xanth w-full md:w-44 h-10"
            >
              <div className="w-full">Back</div>
            </Button>
          </div>
          <div className="text-center my-3 text-neutral-3 font-sharp-sans-bold ">
            {stepper.completeOnboarding ? (
              <>
                <LoadingOutlined />
              </>
            ) : (
              <span
                role="button"
                className="cursor-pointer"
                onClick={() => dispatch(completeOnboardingAction(true))}
              >
                Skip
              </span>
            )}
          </div>

          <div className="text-center pb-16 w-full text-neutral-3 font-sharp-sans">
            4 of 4
          </div>
        </>
      )}
      <MassUpdateStretegyModal />
      <ConfirmProgressModal
        isShowModal={isModalOpen}
        isLoading={isLoading}
        handleBack={() => {
          formChangeRemove();
          onPropagation(false, false, "");
          window.location.href = url;
        }}
        handleCancel={() => {
          onPropagation(true, false, "");
        }}
      />
    </div>
  );
};

export default StrategiesComponent;
