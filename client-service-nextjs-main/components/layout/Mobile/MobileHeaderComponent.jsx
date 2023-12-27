import React, { useEffect, useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import Link from "next/link";
import { CloseOutlined } from "@ant-design/icons";

import UplistMenu from "../components/UplistMenu";
import UplistLogo from "~/components/base/UplistLogo";
import HeaderWrapper from "../common/HeaderWrapper";
import ProfileHeader from "../components/ProfileHeader";

const MobileHeaderComponent = () => {
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, companyLogo } = useSelector((state) => {
    return {
      isAuthenticated: state.auth.data.isAuthenticated,
      companyLogo: state.company.companyLogoDetails.logo,
    };
  }, shallowEqual);

  const toggleMenu = () => {
    const mobileMenuWrapper = document.querySelector(".mobile-menu-wrapper");
    if (mobileMenuWrapper) {
      const mobileMenuOpen = document.querySelector(".mobile-menu-open");
      const uplistLayoutHeader = document.querySelector(".uplist-header");
      if (mobileMenuOpen && uplistLayoutHeader) {
        mobileMenuWrapper.classList.remove("mobile-menu-open");
        uplistLayoutHeader.classList.remove("mobile-menu-open");
      } else {
        uplistLayoutHeader.classList.add("mobile-menu-open");
        mobileMenuWrapper.classList.add("mobile-menu-open");
      }
    }
  };

  const getHeight = () => {
    const mobileMenuWrapper = document.querySelector(".mobile-menu-wrapper");

    const uplistLayout = document.querySelector(".uplist-layout");
    const uplistLayoutHeader = document.querySelector(".uplist-header");

    if (mobileMenuWrapper && uplistLayout && uplistLayoutHeader) {
      const uplistLayoutHeight = uplistLayout.offsetHeight;
      const layoutHeaderHeight = uplistLayoutHeader.offsetHeight;

      const menuHeight = uplistLayoutHeight - layoutHeaderHeight;

      const mobileMenuItems = document.querySelector(".mobile-menu-items");
      if (mobileMenuItems) {
        mobileMenuItems.style.height = `${menuHeight}px`;
      }
    }
  };

  // useEffect(() => {
  //   getHeight();
  // }, []);

  useEffect(() => {
    const entries = performance.getEntriesByType("navigation");
    if (entries[0].type === "reload" || entries[0].type === "navigate") {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <HeaderWrapper isAuthenticated={isAuthenticated}>
        <div
          className={`bg-white flex mx-auto w-full ${
            isAuthenticated
              ? "justify-between items-center"
              : "justify-between items-end"
          }`}
          style={{ maxWidth: "90%" }}
        >
          {isAuthenticated ? (
            <>
              <div
                className="flex flex-1 content-center items-center max-w-[300px]"
                id="print-logo"
              >
                <UplistLogo />
              </div>
              <div className="flex flex-1 content-center items-center">
                <Link
                  href={isAuthenticated ? "/" : "/login"}
                  className="flex flex-1 content-center items-center max-w-[300px]"
                >
                  <UplistLogo />
                </Link>
              </div>
              <div
                className="flex justify-start items-center h-16"
                style={{ padding: "0 0 0 26px" }}
              >
                <img
                  className="cursor-pointer"
                  onClick={() => toggleMenu()}
                  src={window.location.origin + "/icon/BurgerMenuIcon.png"}
                  alt="humbergermenu"
                />
              </div>
            </>
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
      <div className="mobile-menu-wrapper h-screen overflow-y-auto fixed bg-white right-0 top-0 z-10">
        <div className="mobile-menu-container w-full h-full bg-white">
          <div
            className="mobile-menu-header flex items-center justify-between p-4 h-auto"
            style={{ borderBottom: "1px solid #DBE1E8" }}
          >
            <div>
              <UplistLogo />
            </div>
            <div className="flex justify-between items-center gap-12">
              {isAuthenticated && <ProfileHeader />}
              <CloseOutlined
                className="text-2xl h-16 flex items-center"
                onClick={toggleMenu}
              />
            </div>
          </div>
          <div className="mobile-menu-items">
            <div className="h-full overflow-y-auto pt-5 pb-24">
              <UplistMenu />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileHeaderComponent;
