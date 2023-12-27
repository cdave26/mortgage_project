import React, { useEffect, useState, useRef } from "react";
import { Menu } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { shallowEqual, useSelector, useDispatch } from "react-redux";

import { uplistApi } from "~/utils/api-handler";
import config from "~/config";
import { onHandleError } from "~/error/onHandleError";

import Modal from "~/components/modal/Modal";
import { formDialogAlert } from "~/store/ui/action";

const controller = new AbortController();
const { signal } = controller;

const UplistMenu = React.memo(() => {
  const cLink = [
    "/calculators/mortgage-loan",
    "/calculators/rent-vs-own",
    "/calculators/prepayment-savings",
    "/calculators/early-payoff",
    // "/calculators/annual-percentage-rate",
  ];
  const cUsers = [
    "/users",
    "/users/uplist-admin",
    "/users/company-admin",
    "/users/loan-officer",
  ];

  const downLoadProgressRef = useRef(null);
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: { user: userData },
  } = useSelector((state) => state.auth, shallowEqual);

  const {
    formChange: { isChange, isModalOpen },
  } = useSelector((state) => {
    return {
      formChange: state.ui.formChange,
    };
  }, shallowEqual);

  const { sideBarMenu, user } = useSelector((state) => {
    return {
      sideBarMenu: state.ui.sideBarMenu,
      user: state.auth.data.user,
    };
  }, shallowEqual);

  const [selectedKeys, setSelectedKeys] = useState(router?.asPath || "/");
  const [openKeys, setOpenKeys] = useState(
    localStorage.getItem("subMenu") ? [localStorage.getItem("subMenu")] : []
  );
  const [genReport, setGenReport] = useState({
    open: false,
    message: "",
    onprogress: false,
  });

  useEffect(() => {
    // remove currentLink remnants
    if (localStorage.getItem("currentLink")) {
      localStorage.removeItem("currentLink");
    }

    setSelectedKeys(router?.asPath === "/users" ? "users" : router?.asPath);

    if (cLink.includes(router.asPath)) {
      setOpenKeys(["calculators"]);
      localStorage.setItem("subMenu", "calculators");
    } else if (cUsers.includes(router.asPath)) {
      setOpenKeys(["users"]);
      localStorage.setItem("subMenu", "users");
    } else {
      setOpenKeys([]);
      localStorage.removeItem("subMenu");
    }
  }, []);

  const onOpenChange = (keys) => {
    if (keys.at(-1) == undefined) {
      setOpenKeys([]);
      localStorage.removeItem("subMenu");
    } else {
      setOpenKeys([keys.at(-1)]);
      localStorage.setItem("subMenu", keys.at(-1));
    }
  };

  const handleLinks = (strLink) => {
    localStorage.removeItem("viewProfile");

    const submenu = [];
    sideBarMenu.forEach((el) => {
      el.listing.forEach((lis) => {
        submenu.push(lis.link);
      });
    });

    if (!submenu.includes(strLink)) {
      localStorage.removeItem("subMenu");
      setOpenKeys([]);
    }
  };

  const getMenuKey = (menu) => {
    if (menu.label === "View Profile") {
      return `/users/view/${user.id}`;
    }
    if (menu.key) return menu.key;
    return menu.link;
  };

  const getMenuLabel = (menu) => {
    if (menu.link) {
      const defaultProps = {
        href: menu.link,
      };
      if (menu.isUrl) {
        defaultProps.target = "_blank";
        defaultProps.rel = "noopener noreferrer";
      } else {
        defaultProps.onClick = (event) => {
          event.preventDefault();
          if (isChange) {
            onPropagation(true, true, menu.link);
          } else {
            if (Number(userData.user_type_id) === 2) {
              const { pathname } = new URL(window.location.href);
              if (menu.link !== pathname) {
                router.push(menu.link);
              }
            } else {
              if (router.asPath !== menu.link) {
                router.push(menu.link);
              }
            }

            handleLinks(menu.link);
          }
        };
      }

      return <Link {...defaultProps}>{menu.label}</Link>;
    }
    if (menu.label == "Users") {
      return (
        <div
          onClick={() => {
            if (isChange) {
              onPropagation(true, true, `/${menu.label.toLowerCase()}`);
            } else {
              if (router.asPath === "/users") return;
              router.push(`/${menu.label.toLowerCase()}`);
            }
          }}
        >
          {menu.label}
        </div>
      );
    }

    if (menu.label == "Reports") {
      return (
        <div role="button" onClick={() => handleGenReport()}>
          {menu.label}
        </div>
      );
    }

    if (menu.label === "View Profile") {
      const profileLink = `/users/view/${user.id}`;
      return (
        <Link
          href={profileLink}
          onClick={(e) => {
            e.preventDefault();
            if (isChange) {
              onPropagation(true, true, profileLink);
            } else {
              if (router.asPath === profileLink) return;
              localStorage.setItem("viewProfile", "true");
              window.location.href = profileLink;
            }
          }}
        >
          {menu.label}
        </Link>
      );
    }

    return menu.label;
  };

  const NavIcons = (icon, link, firstIcon, secondIcon) => {
    return (
      <img
        src={`${
          router.asPath === link
            ? window.location.origin + `/icon/${firstIcon}.png`
            : window.location.origin + `/icon/${secondIcon}.png`
        }`}
        alt={icon}
      />
    );
  };

  const navigationIcons = (icon, link) => {
    switch (icon) {
      case "homeIcon":
        return NavIcons(icon, link, "HomeIcon", "HomeIconOutline");

      case "listingsIcon":
        return NavIcons(icon, link, "listingIconOutlins", "listingIcon");

      case "stateLicenseIcon":
        return NavIcons(
          icon,
          link,
          "stateLicenseIcon",
          "stateLicenseIconOutline"
        );

      case "companyIcon":
        return NavIcons(icon, link, "companyIconOutline", "companyIcon");

      case "rateProviderIcon":
        return NavIcons(icon, link, "starIconOutline", "starIcon");

      case "preApprovedBuyersIcon":
        return NavIcons(icon, link, "buyerIconOutline", "buyerIcon");

      case "userIcon":
        return NavIcons(
          icon,
          cUsers.includes(selectedKeys) ? selectedKeys : link,
          "userIconOutline",
          "userIcon"
        );

      case "managementIcon":
        return NavIcons(icon, link, "managementIconOutline", "managementIcon");

      case "calculatorIcon":
        return NavIcons(
          icon,
          cLink.includes(selectedKeys) ? selectedKeys : link,
          "calculatorIconOutline",
          "calculatorIcon"
        );

      case "reportsIcon":
        return NavIcons(icon, link, "reportsIcon", "reportsIcon");

      case "marketingFlyerIcon":
        return NavIcons(
          icon,
          link,
          "marketingFlyerIconOutline",
          "marketingFlyerIcon"
        );

      case "flyerManagementIcon":
        return NavIcons(
          icon,
          link,
          "flyerManagementIconOutline",
          "flyerManagementIcon"
        );

      case "priceEngineIcon":
        return NavIcons(
          icon,
          link,
          "priceEngineIconOutline",
          "priceEngineIcon"
        );

      case "contactSupportIcon":
        return NavIcons(icon, link, "userIconOutline", "userIcon");
      default:
        break;
    }
  };

  const menuItems = sideBarMenu.map((menu) => {
    const menuObj = {
      key: getMenuKey(menu),
      label: getMenuLabel(menu),
      // icon: navigationIcons(menu.iconName, menu.link),
    };

    if (menu.listing.length) {
      menuObj.children = menu.listing.map((list) => {
        return {
          key: list.link,
          label: (
            <Link
              href={list.link}
              onClick={(event) => {
                event.preventDefault();
                if (router.asPath !== list.link) {
                  if (isChange) {
                    onPropagation(true, true, list.link);
                  } else {
                    router.push(list.link);
                    handleLinks(list.link);
                  }
                }
              }}
            >
              {list.label}
            </Link>
          ),
        };
      });
    }

    return menuObj;
  });

  const handleGenReport = () => {
    setGenReport({
      ...genReport,
      open: true,
      message: "",
      onprogress: true,
    });

    //show the modal first
    setTimeout(async () => {
      try {
        const response = await uplistApi.get(
          `${config.serviceUrl}/api/admin-report`,
          {
            headers: {
              "Content-Type": "application/vnd.ms-excel",
            },
            onDownloadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              if (downLoadProgressRef.current) {
                downLoadProgressRef.current.innerHTML = progress + "%";
              }
            },
            responseType: "blob",
          },
          signal
        );
        if (response.status === 200) {
          setGenReport({
            ...genReport,
            open: true,
            message: "The report has been generated.",
            onprogress: true,
          });
          const blob = new Blob([response.data], { type: "octet-stream" }),
            href = URL.createObjectURL(blob);
          const a = Object.assign(document.createElement("a"), {
            href,
            style: "display: none",
            download: "report.xlsx",
          });
          setTimeout(() => {
            setGenReport({
              ...genReport,
              open: false,
              message: "",
              onprogress: false,
            });
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(href);
            document.body.removeChild(a);
            if (downLoadProgressRef.current) {
              downLoadProgressRef.current.innerHTML = "0%";
            }
          }, 1000);
        }
      } catch (error) {
        setGenReport({
          ...genReport,
          open: false,
          message: "",
          onprogress: false,
        });
        onHandleError(error, dispatch);
      }
    }, 1000);
  };

  const onPropagation = (change, open, isURL) => {
    dispatch(formDialogAlert(change, open, isURL));
  };

  return (
    <>
      <Menu
        className="bg-white text-neutral-3 font-sharp-sans-semibold text-base"
        defaultSelectedKeys={["1"]}
        mode="inline"
        items={menuItems}
        style={{ padding: "0 12px" }}
        selectedKeys={[selectedKeys]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
      />
      <Modal
        open={genReport.open}
        closeIcon={<></>}
        // onCancel={() => {
        //   if (genReport.onprogress) return;

        //   setGenReport({
        //     ...genReport,
        //     open: false,
        //     message: "",
        //     onprogress: false,
        //   });

        //   controller.abort();
        // }}
        className="modal-progress"
      >
        <div>
          <div className="flex justify-start items-center gap-15 relative">
            <div className="w-12">
              <img
                className="absolute top-0"
                src={`${window.location.origin}/icon/questionMarkICon.png`}
                alt="icon"
              />
            </div>

            <div className="w-full">
              <div className="font-sharp-sans-semibold text-error text-base">
                Generate Report
              </div>
              <div className="font-sharp-sans text-neutral-2 text-sm mt-2">
                {genReport.message
                  ? genReport.message
                  : "Please wait, generating your report. This may take a few minutes."}
              </div>
              <div className="font-sharp-sans text-neutral-2 text-sm mt-2">
                <div className="w-full progress progress-striped active">
                  <div
                    role="progressbar progress-striped"
                    className="progress-bar"
                  >
                    <span ref={downLoadProgressRef} className="mt-1">
                      0%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
});

export default UplistMenu;
