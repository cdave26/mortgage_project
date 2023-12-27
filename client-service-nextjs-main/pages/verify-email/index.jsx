import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import * as jose from "jose";

import { verifyEmail } from "~/store/auth/api";
import { parseToken } from "~/lib/parseToken";
import { onSetUplistCookies } from "~/plugins/onSetUplistCookies";
import { onHandleError } from "~/error/onHandleError";

const VerifyEmail = () => {
  const dispatch = useDispatch();

  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    onVerifyEmail();
  }, []);

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

  const onVerifyEmail = async () => {
    const url = new URL(window.location.href);
    const params = Object.fromEntries(url.searchParams.entries());
    const { email } = parseToken(params.token);

    verifyEmail({ email, token: params.token })
      .then(async (res) => {
        if (res.status === 200) {
          snackBar(res.data.message, "", "success");

          if (window.localStorage.getItem("user")) {
            const secret = new TextEncoder().encode(process.env.SECURITY_APP);
            const token = await new jose.SignJWT({
              userData: res.data.user,
            })
              .setProtectedHeader({ alg: "HS256" })
              .setIssuedAt()
              .sign(secret);

            if ("serviceWorker" in navigator) {
              if (navigator.serviceWorker.controller) {
                //update the tabs
                navigator.serviceWorker.controller.postMessage({
                  channelName: "verify-email",
                  message: res.data.user,
                });
              }
            }

            setIsVerified(true);
            setTimeout(() => {
              onSetUplistCookies(token);
            }, 1000);
          } else {
            setTimeout(() => {
              window.location.href = "/";
            }, 1000);
          }
        }
      })
      .catch((err) => {
        setIsVerified(false);
        onHandleError(err, dispatch);
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      });
  };
  return (
    <div className="flex flex-row justify-center items-center h-screen w-screen">
      <div>
        <div className="flex h-full w-full justify-center items-center">
          <LoadingOutlined className="items-center justify-center text-denim text-5xl" />
        </div>
        <p className="text-neutral-1 font-sharp-sans-medium text-base">
          {isVerified
            ? "Redirect..."
            : "Please wait while we verify your email."}{" "}
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
