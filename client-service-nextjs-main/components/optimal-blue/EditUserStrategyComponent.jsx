import React, { useEffect, useState } from "react";
import { Button, Form } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import config from "~/config";
import { onHandleError } from "~/error/onHandleError";
import { upsertUserStrategyAction } from "~/store/pricingEngine/optimalBlue/action";

import CustomFormItem from "../base/CustomFormItem";
import CustomDivider from "../base/CustomDivider";
import CustomInputNumber from "../base/CustomInputNumber";
import ConfirmProgressModal from "../base/modal/ConfirmProgressModal";
import CustomButton from "../base/CustomButton";
import CustomSelect from "../base/CustomSelect";

const EditUserStrategyComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowModal, setIsShowModal] = useState(false);
  const [originatorList, setOriginatorList] = useState([]);

  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    companyAccountId,
    strategyOptions,
    loadingStrategy,
    loadingUpdateStrategy,
    userToUpdate,
  } = useSelector((state) => {
    return {
      companyAccountId: state.optimalBlue.companyStrategy.company_account_id,
      strategyOptions: state.optimalBlue.companyStrategy.options,
      loadingStrategy: state.optimalBlue.companyStrategy.loading,
      loadingUpdateStrategy: state.optimalBlue.updateUserStrategy.loading,
      userToUpdate: state.optimalBlue.updateUserStrategy.userToUpdate,
    };
  }, shallowEqual);

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

  const handleFinish = async (values) => {
    setIsLoading(true);
    const controller = new AbortController();
    const { signal } = controller;

    try {
      const newValues = {
        ...values,
        business_channel_id: values.business_channel_id.value,
        originator_id: values.originator_id.value,
        company_account_id: companyAccountId,
        price: values.price ?? 0,
      };

      const type = router.query.slug === "edit" ? "strategy" : "userId";

      const response = await upsertUserStrategyAction(
        router.query.id,
        type,
        newValues,
        signal
      );

      if (response.status === 200) {
        snackBar(response.data.message, "", "success");

        setTimeout(() => {
          window.location.href = "/price-engine-ob";
        }, 800);

        setTimeout(() => {
          form.resetFields();
          controller.abort();
        }, 900);
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
    form.resetFields();
    window.history.back();
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
    <div className="mt-8">
      <Link
        href={window.history.state.url}
        className="flex flex-row justify-start items-center gap-2 cursor-pointer mb-12 text-neutral-1"
        onClick={(e) => {
          e.preventDefault();
          checkBackAction();
        }}
      >
        <img
          src={`${window.location.origin}/icon/back-arrow.png`}
          alt="back"
          lazy="loading"
        />
        <span className="text-base font-semibold">Back</span>
      </Link>
      <div className="mx-auto w-full">
        <div className="flex justify-start items-start mt-7 mb-4">
          <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl text-center">
            Update a Price Engine
          </h2>
        </div>
        <CustomDivider />
        <div className="mt-12" id="_add-wrapper-license_">
          <Form form={form} className="mt-5" onFinish={handleFinish}>
            <div id="_inputs-container_">
              <div className="flex justify-between gap-4 items-end">
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
                      disabled={loadingStrategy || !originatorList.length}
                      withsearch="true"
                    />
                  </CustomFormItem>
                </div>
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
              </div>
            </div>

            <div className="w-full flex flex-row-reverse mt-4 gap-3">
              <div className="mb-7 w-full" style={{ maxWidth: "200px" }}>
                <CustomButton
                  htmlType="submit"
                  label="Update"
                  isfullwidth={true}
                  disabled={isLoading}
                  isloading={isLoading.toString()}
                />
              </div>
              <div className="mb-7 w-full" style={{ maxWidth: "200px" }}>
                <Button
                  onClick={() => checkBackAction()}
                  className="bg-white text-neutral-1 font-sharp-sans-bold h-full whitespace-pre-wrap border-xanth w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </div>
      <ConfirmProgressModal
        isShowModal={isShowModal}
        isLoading={isLoading}
        handleBack={() => {
          setIsShowModal(false);
          handleReturnAction();
        }}
        handleCancel={() => setIsShowModal(false)}
      />
    </div>
  );
};

export default EditUserStrategyComponent;
