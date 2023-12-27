import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Form, Row, Button, Modal } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import config from "~/config";
import { onHandleError } from "~/error/onHandleError";
import {
  getCompanyStrategyAction,
  massUpsertUserStrategyAction,
  selectMassUsersAction,
  selectUserStrategyAction,
  showMassUpdateModalAction,
  upsertUserStrategyAction,
} from "~/store/pricingEngine/optimalBlue/action";
import { formChangeRemove } from "~/store/ui/action";
import userTypes from "~/enums/userTypes";

import CustomFormItem from "../base/CustomFormItem";
import CustomInputNumber from "../base/CustomInputNumber";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import CustomSelect from "../base/CustomSelect";

const MassUpdateStretegyModal = () => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [originatorList, setOriginatorList] = useState([]);

  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const {
    showMassModal,
    massDataToUpdate,
    modalMode,

    companyAccountId,
    strategyOptions,
    loadingStrategy,

    loadingUpdateStrategy,
    userToUpdate,
    idToUpdate,
    submitMode,
    userData,
    selectedCompanyId,
  } = useSelector((state) => {
    return {
      showMassModal: state.optimalBlue.massUpdateUserStrategy.showMassModal,
      massDataToUpdate: state.optimalBlue.massUpdateUserStrategy.dataToUpdate,
      modalMode: state.optimalBlue.massUpdateUserStrategy.mode,

      companyAccountId: state.optimalBlue.companyStrategy.company_account_id,
      strategyOptions: state.optimalBlue.companyStrategy.options,
      loadingStrategy: state.optimalBlue.companyStrategy.loading,

      loadingUpdateStrategy: state.optimalBlue.updateUserStrategy.loading,
      userToUpdate: state.optimalBlue.updateUserStrategy.userToUpdate,
      idToUpdate: state.optimalBlue.updateUserStrategy.id,
      submitMode: state.optimalBlue.updateUserStrategy.mode,
      userData: state.auth.data.user,
      selectedCompanyId: state.optimalBlue.companyId,
    };
  }, shallowEqual);

  const isUplistAdmin = userData.user_type_id === userTypes.UPLIST_ADMIN;

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

  useEffect(() => {
    if (!loadingUpdateStrategy && userToUpdate && strategyOptions.length) {
      const selected = strategyOptions.filter(
        (strat) => strat.value === userToUpdate.business_channel_id
      );

      if (selected.length) {
        setOriginatorList(selected[0].originators);

        for (const key in userToUpdate) {
          form.setFields([
            {
              name: `${key}`,
              value: userToUpdate[key],
              label: userToUpdate[key],
            },
          ]);
        }
      }
    }
  }, [userToUpdate, strategyOptions]);

  const handleMassUpdate = async (values) => {
    if (isUplistAdmin && !selectedCompanyId) {
      snackBar("Please select a company.", "", "error");
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    const { signal } = controller;

    try {
      let response = null;
      const payload = {
        ...values,
        business_channel_id: values.business_channel_id.value,
        originator_id: values.originator_id.value,
        company_account_id: companyAccountId,
        company_id: isUplistAdmin ? selectedCompanyId : userData.company_id,
      };

      if (submitMode) {
        const type = submitMode === "edit" ? "strategy" : "userId";

        response = await upsertUserStrategyAction(
          idToUpdate,
          type,
          payload,
          signal
        );
      } else {
        payload.user_ids = massDataToUpdate;
        response = await massUpsertUserStrategyAction(payload, signal);
      }

      if (response && response.status === 200) {
        snackBar(response.data.message, "", "success");

        dispatch(getCompanyStrategyAction());
        dispatch(showMassUpdateModalAction(false, ""));

        if (modalMode === "mass") {
          dispatch(selectMassUsersAction([]));
        } else {
          dispatch(selectUserStrategyAction({}, "", null));
        }

        form.resetFields();
        controller.abort();
        setIsLoading(false);
      }
    } catch (error) {
      onHandleError(error, dispatch);
      setIsLoading(false);
    }
  };

  const handleSelectBusinessChannel = (value) => {
    setOriginatorList([]);
    form.resetFields(["originator_id"]);
    const selected = strategyOptions.filter((strat) => strat.value === value);
    if (selected.length) {
      setOriginatorList(selected[0].originators);
    }
  };

  const handleReturnAction = () => {
    setIsShowModal(false);
    form.resetFields();
    dispatch(showMassUpdateModalAction(false, ""));
    dispatch(selectMassUsersAction([]));
    dispatch(selectUserStrategyAction({}, "", null));
  };

  const checkBackAction = () => {
    if (isLoading) {
      return setIsShowModal(true);
    }

    if (form.isFieldsTouched()) {
      return setIsShowModal(true);
    }

    handleReturnAction();
  };

  return (
    <>
      <Modal
        open={showMassModal}
        className="confirmation"
        footer={null}
        centered
        onCancel={checkBackAction}
      >
        <div style={{ marginBottom: "25px", paddingBottom: "5px" }}>
          <div
            className="flex justify-start items-center relative"
            style={{ gap: "15px" }}
          >
            <div className="text-black text-header-5 font-sharp-sans-bold mt-1">
              {modalMode === "mass" ? "Mass Update" : "Update User Strategy"}
            </div>
          </div>
        </div>

        <Form form={form} onFinish={handleMassUpdate}>
          <div>
            <Row>
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
                    disabled={!strategyOptions.length || loadingStrategy}
                    onChange={(opt) => {
                      handleSelectBusinessChannel(opt?.value);
                    }}
                    withsearch="true"
                    autoFocus={true}
                  />
                </CustomFormItem>
              </div>
            </Row>
            <Row>
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
                    disabled={loadingStrategy || !originatorList.length}
                    withsearch="true"
                  />
                </CustomFormItem>
              </div>
            </Row>
            <Row>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="Default Price"
                  name="price"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomInputNumber
                    type="currency"
                    disabled={loadingStrategy || !originatorList.length}
                    placeholder="Price"
                    maxnumber={config.ob_strategy.max_price}
                    min={config.ob_strategy.min_price}
                    precision={3}
                  />
                </CustomFormItem>
              </div>
            </Row>
          </div>

          <div
            className="flex justify-end items center"
            style={{ gap: "10px" }}
          >
            <Button
              className="flex items-center justify-center border border-solid border-xanth rounded-md text-sm font-sharp-sans-bold"
              style={{ color: "rgba(0, 0, 0, 0.85)" }}
              onClick={() => checkBackAction()}
            >
              Cancel
            </Button>
            <Button
              className="flex items-center justify-center bg-xanth text-neutral-1 font-sharp-sans-bold text-sm w-full px-2"
              style={{ maxWidth: "90px" }}
              htmlType="submit"
              disabled={isLoading}
            >
              {isLoading ? <LoadingOutlined /> : "Update"}
            </Button>
          </div>
        </Form>
      </Modal>

      <ConfirmProgressModal
        isShowModal={isShowModal}
        isLoading={isLoading}
        handleBack={() => {
          formChangeRemove();
          handleReturnAction();
        }}
        handleCancel={() => setIsShowModal(false)}
      />
    </>
  );
};

export default MassUpdateStretegyModal;
