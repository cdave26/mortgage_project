import React, { useEffect, useState } from "react";
import Head from "next/head";
import CustomButton from "../base/CustomButton";
import { shallowEqual, useSelector } from "react-redux";

const ErrorPage = () => {
  const [shouldShowReturn, setShouldShowReturn] = useState(false);
  const [returnLink, setReturnLink] = useState("/");

  const { user, isAuthenticated } = useSelector((state) => {
    return {
      user: state?.auth?.data?.user,
      isAuthenticated: state?.auth?.data?.isAuthenticated,
    };
  }, shallowEqual);

  useEffect(() => {
    let isBuyer = user && Boolean(user.buyer_id || false);

    if (typeof window !== "undefined") {
      const pathArray = location.pathname.split("/");
      const arrayLength = pathArray.length;
      const isCompanyPath = arrayLength >= 3 && pathArray.includes("404");
      const isEnterprisePath = arrayLength <= 2;

      setShouldShowReturn(isEnterprisePath || !isCompanyPath);
    }

    setReturnLink(isBuyer && isAuthenticated ? "/buyer" : "/");
  }, [user]);

  return (
    <>
      <Head>
        <title>404 | Page Not Found</title>
      </Head>
      <div className="container">
        <h1 className="animated-text">404</h1>
        <p className="animated-text">
          The page you're looking for couldn't be found.
        </p>

        {shouldShowReturn && (
          <CustomButton label={"Return"} type="link" href={returnLink} />
        )}
      </div>
    </>
  );
};

export default ErrorPage;
