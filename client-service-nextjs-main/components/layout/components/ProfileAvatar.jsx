import React, { useState, useEffect } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Avatar, Dropdown } from "antd";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";

import config from "~/config";
import { onRemoveCookies } from "~/plugins/onRemoveCookies";
import {
  formChangeRemove,
  formDialogAlert,
  getChangeForm,
  setSpinningAction,
} from "~/store/ui/action";
import { getUserAction, isEditUserAction } from "~/store/users/action";
import { getPricingEngineAction } from "~/store/pricingEngine/action";
import { getUserTypesAction } from "~/store/auth/action";
import { getCompanyListByIdAction } from "~/store/company/action";

const ProfileAvatar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [redirectTo, setRedirectTo] = useState("");

  const { user } = useSelector((state) => {
    return {
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const {
    formChange: { isChange, isModalOpen, url },
  } = useSelector((state) => {
    return {
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  useEffect(() => {
    const login = localStorage.getItem("login");
    setRedirectTo(login);
  }, []);

  /**
   * Verify email: if open the other tab and verify email
   * @param {MessageEvent} event
   * @returns {void}
   */
  const receiveUpdateFromServiceWorker = (event) => {
    if (event.currentTarget.name === "updateAuthProfile") {
      dispatch({
        type: "token",
        payload: {
          user: event.data,
          isAuthenticated: true,
        },
      });
      // When done, disconnect from the channel
      event.currentTarget.close();
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel("updateAuthProfile");
    channel.addEventListener("message", (event) =>
      receiveUpdateFromServiceWorker(event)
    );

    return () =>
      channel.removeEventListener("message", (event) =>
        receiveUpdateFromServiceWorker(event)
      );
  }, []);

  const items = [
    {
      key: "edit",
      label: "My Profile",
      onClick: () => {
        if (isChange) {
          dispatch(formDialogAlert(true, true, `/users/edit/${user.id}`));
        } else {
          router.push(`/users/edit/${user.id}`);
          const { pathname } = new URL(window.location.href);
          const id = pathname.split("/").pop();
          if (isNaN(id)) return;

          if (Number(id) !== user.id) {
            dispatch(isEditUserAction(true));
            dispatch(getPricingEngineAction());
            dispatch(getUserTypesAction());
            dispatch(getCompanyListByIdAction());
            dispatch(getUserAction(user.id));
          }
        }
      },
    },
    {
      key: "logout",
      label: "Logout",
      onClick: () => {
        const formChange = getChangeForm();
        const obj = JSON.parse(formChange);

        const runNext = () => {
          dispatch(setSpinningAction(true));
          onRemoveCookies(redirectTo);
        };
        if (isChange || (formChange && obj && obj.isChange)) {
          dispatch(formDialogAlert(false, false, ""));
          formChangeRemove();
          setTimeout(() => {
            runNext();
          }, 0);
        } else {
          runNext();
        }
      },
    },
  ];

  return (
    <div className="flex justify-center items-center flex-row relative h-12 w-12">
      <Dropdown trigger={["click"]} menu={{ items }} placement="bottomRight">
        <div className="flex justify-center items-center cursor-pointer">
          <div>
            <Avatar
              size={45}
              className="flex justify-center bg-xanth"
              src={
                user.profile_logo
                  ? `${config.storagePath}${user.profile_logo}`
                  : `${window.location.origin}/img/profile-image.png`
              }
              alt="profile-image"
            />
            <div
              className="absolute bottom-0 right-0 bg-white flex justify-center items-center cursor-pointer p-2 shadow-default"
              style={{
                borderRadius: "50%",
                height: "14px",
                width: "14px",
              }}
            >
              <DownOutlined
                style={{ fontSize: "12px" }}
                className="text-xanth"
              />
            </div>
          </div>
        </div>
      </Dropdown>
    </div>
  );
};

export default ProfileAvatar;
