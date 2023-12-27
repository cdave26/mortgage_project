import React, { useEffect } from "react";
import { Layout as Layouts, Spin, Grid } from "antd";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { sendVerificationEmail } from "~/store/auth/api";
import { setSpinningAction } from "~/store/ui/action";
import { onHandleError } from "~/error/onHandleError";

import FooterComponent from "~/components/layout/FooterComponent";
import HeaderComponent from "~/components/layout/HeaderComponent";
import SiderComponent from "~/components/layout/SiderComponent";
import MobileHeaderComponent from "~/components/layout/Mobile/MobileHeaderComponent";
import UplistMenu from "~/components/layout/components/UplistMenu";

const { Content } = Layouts;

const Layout = ({ children }) => {
  const dispatch = useDispatch();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = screens.lg === false;

  const {
    loading,
    isSpinning,
    isAuthenticated,
    user: authenticatedUser,
  } = useSelector((state) => {
    return {
      user: state.auth.data.user,
      isAuthenticated: state.auth.data.isAuthenticated,
      isSpinning: state.ui.isSpinning,
      loading: state.ui.isRendered,
    };
  }, shallowEqual);

  useEffect(() => {
    const channel = new BroadcastChannel("verify-email");
    channel.addEventListener("message", (event) => verifyEmail(event));

    return () =>
      channel.removeEventListener("message", (event) => verifyEmail(event));
  }, []);

  /**
   * Verify email: if open the other tab and verify email
   * @param {MessageEvent} event
   * @returns {void}
   */

  const verifyEmail = async (event) => {
    if (event.currentTarget.name === "verify-email") {
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

  const onSendEmailVerification = () => {
    const controller = new AbortController();
    const { signal } = controller;
    dispatch(setSpinningAction(true));
    sendVerificationEmail({ email: authenticatedUser.email }, signal)
      .then(async (res) => {
        if (res.status === 200) {
          dispatch({
            type: "UI/snackbars",
            payload: {
              open: true,
              message: res.data.message,
              description: "",
              position: "topRight",
              type: "success",
            },
          });
        }
      })
      .catch((err) => {
        onHandleError(err, dispatch);
      })
      .finally(() => {
        dispatch(setSpinningAction(false));
      });
  };

  const isEmailVerified = () => {
    return (
      isAuthenticated &&
      authenticatedUser &&
      !authenticatedUser.email_verified_at
    );
  };

  const handleCloseNotification = () => {
    const notification = document.querySelector(".email-notification");
    const headerSpacing = document.querySelectorAll(".navigation-spacing");
    if (notification) {
      notification.style.display = "none";
      headerSpacing.forEach((el) => {
        el.style.marginTop = "0px";
      });
    }
  };

  const loadingOutlined = (
    <LoadingOutlined
      className="items-center justify-center text-denim text-5xl"
      spin
    />
  );

  const onboarding = (user) => {
    if (user) {
      if ([2, 3].includes(Number(user.user_type_id))) {
        if (user.iscomplete_onboarding === 1) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  };

  return (
    <Spin
      spinning={isSpinning}
      className="max-h-screen"
      indicator={loadingOutlined}
      id="_ant-spin-container_"
    >
      <div
        className={`layout-wrapper ${
          onboarding(authenticatedUser) && "layout-wrapper-not-auth"
        } ${!isAuthenticated && "layout-wrapper-not-auth"}`}
        id="_layout-wrapper_"
      >
        {!onboarding(authenticatedUser) && isEmailVerified() && (
          <div className="not-verified w-full bg-denim h-fit  text-center">
            <p className="text-white font-sharp-sans-semibold text-neutral-7 text-base email-notification px-2 pt-3">
              Please check your inbox to verify your email address. If you did
              not receive a verification link, please click{" "}
              <a onClick={onSendEmailVerification} className="text-xanth">
                here
              </a>{" "}
              .
              <CloseOutlined
                className="absolute right-0 top-0 m-2 text-white"
                onClick={handleCloseNotification}
              />
            </p>
          </div>
        )}
        {!isMobile && (
          <div
            className={`${
              isAuthenticated
                ? onboarding(authenticatedUser)
                  ? "layout-sidebar-remove"
                  : "layout-container-sider"
                : "layout-sidebar-remove"
            }`}
          >
            {isAuthenticated
              ? !onboarding(authenticatedUser) && <SiderComponent />
              : null}
          </div>
        )}
        <div className="layout-container-body">
          <Layouts
            className="uplist-layout bg-white navigation-spacing"
            id="print-section-container"
          >
            {isMobile ? <MobileHeaderComponent /> : <HeaderComponent />}
            <Content className="overflow-auto bg-white h-full">
              <div
                className={`h-full mx-auto py-8 md:pt-[62px] md:pb-8`}
                style={{ maxWidth: "90%" }}
              >
                {loading ? (
                  <div className="bg-white flex h-full w-full justify-center items-center">
                    {loadingOutlined}
                  </div>
                ) : (
                  children
                )}
              </div>
            </Content>
          </Layouts>
        </div>
        <div className="layout-footer">
          <FooterComponent />
        </div>
      </div>
    </Spin>
  );
};

export default Layout;
