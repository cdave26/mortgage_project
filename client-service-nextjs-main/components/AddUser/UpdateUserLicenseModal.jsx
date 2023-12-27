import React, { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Form, Row, Button, Modal, Checkbox } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import config from "~/config";
import CustomFormItem from "../base/CustomFormItem";
import CustomInput from "../base/CustomInput";
import { find, map, pull } from "lodash";
import { USERS } from "~/store/users/type";
import { getLicensesByUser, updateLicenseAction } from "~/store/licenses/action";
import { UI } from "~/store/ui/type";
import { onHandleError } from "~/error/onHandleError";
import { defaultPagination } from "~/utils/constants";
import CustomSelect from "../base/CustomSelect";

const UpdateUserLicenseModal = () => {
  const dispatch = useDispatch()
  const [form] = Form.useForm()

  const {
    open,
    updateUserLicense,
    licenses,
    companystates,
    loadingLicense,
    loadingCompanyStates,
    user,
  } = useSelector((state) => {
    const updateUserLicense = state.users.updateUserLicense
    const listOfLicenses = state.licenses.listOfLicenses
    const statesPerCompany = state.licenseStates.statesPerCompany

    return {
      open: updateUserLicense.openModal,
      updateUserLicense,
      licenses: listOfLicenses.list,
      companystates: statesPerCompany.data,
      loadingLicense: listOfLicenses.loading,
      loadingCompanyStates: statesPerCompany.loading,
      user: state.users.updateUser.user,
    };
  }, shallowEqual)

  const [states, setStates] = useState([])
  const [nmlsID, setUserNMLSID] = useState(null)

  useEffect(() => {
    if (!open || !licenses.data) return

    const {
      state_id, license,
    } = updateUserLicense.license

    const states = companystates.filter(state => {
      const states = map(licenses.data, 'state_id')
      pull(states, state_id)
      return !states.includes(state.key)
    })

    const state = find(states, {
      key: state_id,
    })

    form.setFields([{
      name: 'state',
      value: state,
      errors: [],
    }])

    form.setFields([{
      name: 'license',
      value: license,
      errors: [],
    }])

    setStates(states)
  }, [open, licenses, companystates])

  const [isLoading, loading] = useState(false)

  const updateLicense = async (fields) => {
    loading(true)

    const controller = new AbortController()
    const state = find(companystates, {
      key: fields.state.key,
    })

    try {
      const { status, data } = await dispatch(
        updateLicenseAction(updateUserLicense.license.id, {
          state_id: state.key,
          user_id: user.id,
          license: fields.license,
        }, controller.signal)
      )

      if (status === 200) {
        await getLicensesByUser(
          user.id,
          1,
          defaultPagination.pageSize,
          '',
          '',
          'updated_at',
          'desc',
        )

        dispatch({
          type: UI.snackbars,
          payload: {
            open: true,
            message: data.message,
            position: 'topRight',
            type: 'success',
          },
        })
      }
    } catch (error) {
      onHandleError(error, dispatch)
    }

    loading(false)
    actionButton('close')
  }

  const actionButton = (action) => {
    if (['cancel', 'close'].includes(action)) {
      dispatch({
        type: USERS.updateUserLicense,
        payload: {
          ...updateUserLicense,
          openModal: false,
        },
      })
      setUserNMLSID(null)
      return
    }
  }

  const useUserNMLSID = event => {
    const license = event.target.checked
      ? user.nmls_num : null

    setUserNMLSID(license)

    form.setFields([{
      name: 'license',
      value: license,
    }])
  }

  return (
    <>
      <Modal
        open={open}
        className="confirmation"
        footer={null}
        centered
        onCancel={() => actionButton('cancel')}
      >
        <div style={{ marginBottom: "25px", paddingBottom: "5px" }}>
          <div
            className="flex justify-start items-center relative"
            style={{ gap: "15px" }}
          >
            <div className="text-black text-header-5 font-sharp-sans-bold mt-1">
              Update a License
            </div>
          </div>
        </div>

        <Form form={form} onFinish={updateLicense}>
          <div>
            <Row>
              <div className="flex-1 w-full mb-6">
                <Checkbox
                  checked={nmlsID}
                  onChange={useUserNMLSID}
                  className="font-sharp-sans-medium text-neutral-3"
                >
                  <div className="text-neutral-2 font-sharp-sans-semibold text-body-4">
                    Use NMLS ID for the selected state
                  </div>
                </Checkbox>
              </div>
            </Row>
            <Row>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="State"
                  name="state"
                  required
                  rules={config.requiredRule.slice(0, 1)}
                >
                  <CustomSelect
                    placeholder="Select a State"
                    options={states}
                    disabled={loadingCompanyStates && loadingLicense}
                    withsearch="true"
                    statesearch="true"
                  />
                </CustomFormItem>
              </div>
            </Row>
            <Row>
              <div className="flex-1 w-full">
                <CustomFormItem
                  label="License"
                  name="license"
                  required
                  rules={config.requiredRule}
                >
                  <CustomInput
                    type="text"
                    placeholder="Enter a License"
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
              onClick={() => actionButton('cancel')}
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
    </>
  );
};

export default UpdateUserLicenseModal;
