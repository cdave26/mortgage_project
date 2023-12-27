import React, { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import Link from "next/link";

import UplistLogo from "../base/UplistLogo";
import HeaderWrapper from "./common/HeaderWrapper";
import ProfileHeader from "./components/ProfileHeader";

const HeaderComponent = (_) => {
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, user, companyLogo } = useSelector((state) => {
    return {
      isAuthenticated: state.auth.data.isAuthenticated,
      user: state.auth.data.user,
      companyLogo: state.company.companyLogoDetails.logo,
    };
  }, shallowEqual);

  useEffect(() => {
    const entries = performance.getEntriesByType("navigation");
    if (entries[0].type === "reload" || entries[0].type === "navigate") {
      setLoading(false);
    }
  }, []);

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

  const getHeaderJustifyStyle = () => {
    const styleClass = "justify-between items-end";

    if (isAuthenticated) {
      if (onboarding(user)) {
        return styleClass;
      }
      return "justify-end items-center";
    }
    return styleClass;
  };

  return (
    <HeaderWrapper isAuthenticated={isAuthenticated}>
      <div
        className={`bg-white flex mx-auto w-full ${getHeaderJustifyStyle()}`}
        style={{ maxWidth: "90%" }}
      >
        <div
          className="flex flex-1 content-center items-center max-w-[300px]"
          id="print-logo"
        >
          <UplistLogo />
        </div>

        {isAuthenticated && onboarding(user) && (
          <div className="flex flex-1 content-center items-center max-w-[300px]">
            <UplistLogo />
          </div>
        )}

        {isAuthenticated ? (
          <ProfileHeader />
        ) : (
          !loading && (
            <div>
              <Link
                href={isAuthenticated ? "/" : "/login"}
                className="flex flex-1 content-center items-center max-w-[300px]"
              >
                <img
                  src={companyLogo || `/img/uplist_wordmark.png`}
                  alt="uplist logo"
                  className={`max-w-[300px]`}
                  style={{ maxHeight: `${!companyLogo ? 80 : 52}px` }}
                />
              </Link>
            </div>
          )
        )}
      </div>
    </HeaderWrapper>
  );
};

export default HeaderComponent;
