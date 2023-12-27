import React, { useState } from "react";
import { Button, Checkbox, Modal, Row } from "antd";
import OtpInput from "react-otp-input";
import { useDispatch, useSelector } from "react-redux";
import { LoadingOutlined } from "@ant-design/icons";

import {
  onOpenOtpModal,
  onOpenResetPasswordModal,
  onSetUserEmail,
} from "~/store/auth/action";
import { getCookie, logout, requestOtp, verifyOtp } from "~/store/auth/api";
import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { onHandleError } from "~/error/onHandleError";
import ipify from "~/utils/ipify";
import OTPChannels from "~/enums/OTPChannels";
import userTypes from "~/enums/userTypes";

import { MobileIcon, EmailIcon } from "~/icons/icon";
import CustomButton from "~/components/base/CustomButton";
import CustomDivider from "~/components/base/CustomDivider";
import device from "~/store/device/type";

const VerificationOtpModal = (props) => {
  const { isbuyer } = props;
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trusted, trustThisDevice] = useState(false);
  const [otpChannel, setOTPChannel] = useState(null);
  const [isOTPVerificationFormVisible, showOTPVerificationForm] =
    useState(false);
  const dispatch = useDispatch();

  const {
    openOtpModal,
    userEmail,
    data: { user },
  } = useSelector((state) => state.auth);

  const source = localStorage.getItem("source");

  const recipient = {
    SMS: "mobile number",
    EMAIL: "email",
  };

  const generateOTP = (email, channel) =>
    requestOtp({ email, channel })
      .then((response) => {
        setIsLoading(false);
        dispatch({
          type: "UI/snackbars",
          payload: {
            open: true,
            message: "Success",
            description: response.data.message,
            position: "topRight",
            type: "success",
          },
        });
      })
      .catch((error) => {
        setIsLoading(false);
        setOTPChannel(null);
        showOTPVerificationForm(false);
        onOpenOtpModal(false, dispatch);
        return onHandleError(error, dispatch);
      });

  const requestOTP = async (channel) => {
    setIsLoading(true);
    setOTPChannel(channel);
    await generateOTP(userEmail, channel);
    showOTPVerificationForm(true);
  };

  const handleChange = (otp) => setOtp(otp);

  const handleFinish = () => {
    setIsLoading(true);
    getCookie()
      .then(async () => {
        const controller = new AbortController();
        const { signal } = controller;

        const ip = await ipify();

        const payload = {
          email: userEmail, otp, ip, trusted,
        }

        if (source === 'forgot-password') {
          payload.trusted = false

          dispatch({
            type: device.trusted,
            payload: {
              ip,
              trusted,
            },
          })
        }

        verifyOtp(payload, signal)
          .then((res) => {
            setIsLoading(false)
            trustThisDevice(false)

            if (res.data.authorized) {
              // todo add onsetuplistcookies here
              if (source && source === "forgot-password") {
                onOpenResetPasswordModal(true, dispatch);
                onOpenOtpModal(false, dispatch);
                setOtp("");
                showOTPVerificationForm(false);
                setOTPChannel(null);
                return;
              } else {
                onOpenOtpModal(false, dispatch);
                setOtp("");

                const token = window.localStorage.getItem("user");

                onSetUplistCookies(
                  token,
                  null,
                  user.user_type.id === userTypes.BUYER
                )
                  .then(() => {
                    dispatch({
                      type: "UI/snackbars",
                      payload: {
                        open: true,
                        message: "Success",
                        description: "Authentication Successful",
                        position: "topRight",
                        type: "success",
                      },
                    });
                    if ("serviceWorker" in navigator) {
                      if (navigator.serviceWorker.controller) {
                        navigator.serviceWorker.controller.postMessage({
                          channelName: "logout-login",
                          message: "",
                        });
                      }
                    }
                  })
                  .catch(() => {
                    logout();
                  });
                return;
              }
            }
          })
          .catch((err) => {
            setIsLoading(false);
            return onHandleError(err, dispatch);
          });
      })
      .catch((err) => {
        setIsLoading(false);
        return onHandleError(err, dispatch);
      });
  };

  const handleResendOtp = () => {
    setIsLoading(true);

    getCookie()
      .then(() => generateOTP(userEmail, otpChannel))
      .catch((err) => {
        setIsLoading(false);
        return onHandleError(err, dispatch);
      });
  };

  const handleClose = () => {
    setIsLoading(true)
    trustThisDevice(false)

    // automatically close if OTP is from forgot-password
    if (source && source === "forgot-password") {
      onOpenOtpModal(false, dispatch);
      onSetUserEmail(null, dispatch);
      setOtp("");
      setIsLoading(false);
      window.localStorage.removeItem("source");
      showOTPVerificationForm(false);
      setOTPChannel(null);
      return;
    } else {
      logout()
        .then(() => {
          window.localStorage.removeItem("user");
          dispatch({ type: "logout" });
          onOpenOtpModal(false, dispatch);
          setOtp("");
          setIsLoading(false);
          showOTPVerificationForm(false);
          setOTPChannel(null);
        })
        .catch((err) => {
          setIsLoading(false);
          return onHandleError(err, dispatch);
        });
    }
  };

  return (
    <>
      <Modal
        centered
        open={openOtpModal}
        footer={null}
        width={400}
        onCancel={handleClose}
        className="prompt"
      >
        <Row className="flex justify-center w-full items-center">
          <div className="bg-white h-fit">
            <div className="flex flex-col items-center mb-6">
              <Row className="mb-4">
                <h2 className="text-denim my-0 font-sharp-sans-bold text-3xl">
                  Verification
                </h2>
              </Row>
              <CustomDivider color={isbuyer && "#00CFE1"} />
              <Row>
                <p className="text-neutral-3 my-0 text-base text-center font-sharp-sans-medium">
                  {!isOTPVerificationFormVisible
                    ? "Please select an option to send the One-Time Password (OTP)."
                    : `We sent a verification code to your ${recipient[otpChannel]}.
                        Enter the code from the ${recipient[otpChannel]} in the field below.`}
                </p>
              </Row>
            </div>
            {!isOTPVerificationFormVisible ? (
              <div className="flex gap-5 place-content-center mb-3">
                {/*
                { user?.mobile_number &&
                  <div
                    className={`${
                      isLoading ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`flex h-[138px] w-[117px] items-center rounded-2xl shadow-xl relative ${
                        otpChannel === OTPChannels.SMS && "bg-[#FFC160]"
                      } ${isLoading && "pointer-events-none"}`}
                      onClick={() => requestOTP(OTPChannels.SMS)}
                    >
                      {isLoading && otpChannel === OTPChannels.SMS && (
                        <LoadingOutlined className="absolute left-0 right-0 text-2xl" />
                      )}
                      <div className="grid gap-3.5 justify-items-center text-center w-full">
                        <MobileIcon
                          width="33"
                          height="32"
                          fill={
                            otpChannel === OTPChannels.SMS ? "#00162E" : "#0662C7"
                          }
                        />
                        <span className="text-sm font-semibold">
                          Send via Phone Number
                        </span>
                      </div>
                    </div>
                  </div>
                }
                */}
                <div
                  className={`${
                    isLoading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`flex h-[138px] w-[117px] items-center rounded-2xl shadow-xl relative ${
                      otpChannel === OTPChannels.EMAIL && "bg-[#FFC160]"
                    } ${isLoading && "pointer-events-none"}`}
                    onClick={() => requestOTP(OTPChannels.EMAIL)}
                  >
                    {isLoading && otpChannel === OTPChannels.EMAIL && (
                      <LoadingOutlined className="absolute left-0 right-0 text-2xl" />
                    )}
                    <div className="grid gap-3.5 justify-items-center text-center w-full">
                      <EmailIcon
                        width="33"
                        height="32"
                        fill={
                          otpChannel === OTPChannels.EMAIL ? "#00162E" : "#0662C7"
                        }
                      />
                      <span className="text-sm font-semibold">
                        Send via Email
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <React.Fragment>
                <div className="mb-6">
                  <OtpInput
                    value={otp}
                    onChange={handleChange}
                    numInputs={6}
                    className="otp-input"
                    inputStyle={{
                      height: "3rem",
                      fontSize: "1rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #DBE1E8",
                      fontFamily: "sharp-sans-medium, sans-serif",
                      color: "#4B5A6A",
                    }}
                    containerStyle={{ justifyContent: "space-around" }}
                    isInputNum={true}
                  />
                </div>
                <Checkbox
                  className="mb-6"
                  onChange={(event) => trustThisDevice(event.target.checked)}
                >
                  <span className="text-neutral-2 font-sharp-sans">
                    Trust this device for 30 days?
                  </span>
                </Checkbox>
                <CustomButton
                  label="Verify"
                  isfullwidth={true}
                  onClick={handleFinish}
                  disabled={isLoading}
                  isloading={isLoading.toString()}
                  isbuyer={isbuyer}
                />
                <Row className="mt-5 flex justify-center">
                  <Button
                    type="link"
                    className={`${
                      isbuyer ? "text-buyer" : "text-xanth"
                    } font-sharp-sans-bold p-0`}
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </Button>
                </Row>
              </React.Fragment>
            )}
          </div>
        </Row>
      </Modal>
    </>
  );
};

export default VerificationOtpModal;
