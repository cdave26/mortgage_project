import React, { useContext, useEffect, useState } from "react";
import { Col, Dropdown, Layout as Layouts, Row, Space, Spin, Grid } from "antd";
import {
  DownOutlined,
  LoadingOutlined,
  SettingFilled,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useSelector, shallowEqual } from "react-redux";
import config from "~/config";
import { onRemoveCookies } from "~/plugins/onRemoveCookies";
import { HomePriceContext } from "~/utils/context";
import userTypesEnum from "~/enums/userTypes";

import FooterComponent from "~/components/layout/FooterComponent";

const { Header, Content } = Layouts;

const PublicLayout = ({
  children,
  fullwidth = false,
  childrenloading = false,
}) => {
  const router = useRouter();
  const { pathname } = router;

  const { contextData: homePriceContextData } = useContext(HomePriceContext);
  const [url, setUrl] = useState("");

  const showDropdownMenu = (url) =>
    ["/buyer/profile", "/buyer"].some((route) => url === route);

  const isBuyer = pathname.includes("buyer");
  const isRoutePublicListing = pathname.split("/")[2] === "listing";
  const isRoutePublicQuickQuote = pathname.split("/")[2] === "quick-quote";
  const isRoutePublicAgentListing = pathname.split("/")[2] === "agent-listing";
  const hideCalculatorMenu = ["agent-listing"];
  const excludedBuyerRoute = ["register", "login"];
  const pattern = new RegExp(excludedBuyerRoute.join("|"));
  const isExcludedBuyerRoute = isBuyer && pattern.test(pathname);
  const isLoggedIn =
    typeof window !== "undefined" && window.localStorage.hasOwnProperty("user");
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobileXS = screens.md === false;

  const {
    loading,
    isSpinning,
    user,
    publicListingData,
    publicQuickQuoteData,
    publicAgentListingData,
    companyDetails,
  } = useSelector(
    (state) => ({
      loading: state.ui.isRendered,
      isSpinning: state.ui.isSpinning,
      user: state.auth?.data,
      publicListingData: state?.publicStore?.publicListing?.data,
      publicQuickQuoteData: state?.publicStore?.publicQuickQuote?.data,
      publicAgentListingData:
        state?.publicStore?.publicAgentListing?.loanOfficerData,
      companyDetails: state.company?.companyLogoDetails,
    }),
    shallowEqual
  );

  const constructLink = (route) => {
    return `${config.appUrl}/${isBuyer ? "buyer" : "calculators"}/${route}`;
  };

  const calculatorItems = [
    {
      label: "Loan Payment & Amortization Calculator",
      link: constructLink("mortgage-loan"),
    },
    {
      label: "Rent vs Own Calculator",
      link: constructLink("rent-vs-own"),
    },
    {
      label: "Early Payoff Calculator",
      link: constructLink("early-payoff"),
    },
    {
      label: "Prepayment Savings Calculator",
      link: constructLink("prepayment-savings"),
    },
    // {
    //   label: "Annual Percentage Rate (APR) Calculator",
    //   link: constructLink("annual-percentage-rate"),
    // },
  ];

  const buyerItems = [
    {
      label: "Home",
      link: constructLink("/"),
    },
    {
      label: "My Profile",
      link: constructLink("profile"),
    },
    {
      label: "Logout",
      onClick: () => onRemoveCookies(true),
    },
  ];

  const dropdownItems = () => {
    const items = isBuyer ? buyerItems : calculatorItems;

    return items.map((item, idx) => {
      return {
        key: idx + 1,
        label: (
          <a
            target={!isBuyer ? "_blank".toString() : null}
            rel="noopener noreferrer"
            href={item?.link}
            onClick={item?.onClick}
          >
            {item.label}
          </a>
        ),
      };
    });
  };

  const getBuyerLogo = () => {
    if (
      homePriceContextData &&
      Object.keys(homePriceContextData?.buyerData).length
    ) {
      const data = homePriceContextData?.buyerData;
      if (
        data?.loanOfficer?.company?.allow_loan_officer_to_upload_logo &&
        data?.loanOfficer?.user_type_id === userTypesEnum.LOAN_OFFICER &&
        data?.loanOfficer?.custom_logo_flyers
      ) {
        return `${config.storagePath}${data?.loanOfficer?.custom_logo_flyers}`;
      }

      return `${config.storagePath}${data?.loanOfficer?.company?.company_logo}`;
    }

    return companyDetails?.logo;
  };

  const getPubListingLogo = () => {
    if (
      publicListingData?.company?.allow_loan_officer_to_upload_logo &&
      publicListingData?.user?.user_type_id === userTypesEnum.LOAN_OFFICER &&
      publicListingData?.user?.custom_logo_flyers
    ) {
      return publicListingData?.user?.custom_logo_flyers;
    }
    return publicListingData?.company?.company_logo;
  };

  const getPubQuickQuoteLogo = () => {
    if (
      publicQuickQuoteData?.company?.allow_loan_officer_to_upload_logo &&
      publicQuickQuoteData?.user_type_id === userTypesEnum.LOAN_OFFICER &&
      publicQuickQuoteData?.custom_logo_flyers
    ) {
      return publicQuickQuoteData?.custom_logo_flyers;
    }
    return publicQuickQuoteData?.company?.company_logo;
  };

  const getPubAgentListingLogo = () => {
    if (
      publicAgentListingData?.company?.allow_loan_officer_to_upload_logo &&
      publicAgentListingData?.user_type_id === userTypesEnum.LOAN_OFFICER &&
      publicAgentListingData?.custom_logo_flyers
    ) {
      return publicAgentListingData?.custom_logo_flyers;
    }
    return publicAgentListingData?.company?.company_logo;
  };

  const handleSetLogo = () => {
    let defaultLogo = "/img/uplist_wordmark.png";

    if (isRoutePublicListing) {
      const logo = getPubListingLogo();
      defaultLogo = logo ? `${config.storagePath}${logo}` : defaultLogo;
    } else if (isRoutePublicQuickQuote) {
      const logo = getPubQuickQuoteLogo();
      defaultLogo = logo ? `${config.storagePath}${logo}` : defaultLogo;
    } else if (isRoutePublicAgentListing) {
      const logo = getPubAgentListingLogo();
      defaultLogo = logo ? `${config.storagePath}${logo}` : defaultLogo;
    } else if (isBuyer) {
      const logo = getBuyerLogo();
      defaultLogo = logo ? logo : defaultLogo;
    } else {
      defaultLogo;
    }

    setUrl(defaultLogo);
  };

  useEffect(() => {
    if (
      (publicListingData && Object.keys(publicListingData).length) ||
      (publicQuickQuoteData && Object.keys(publicQuickQuoteData).length) ||
      (publicAgentListingData && Object.keys(publicAgentListingData).length) ||
      (homePriceContextData &&
        Object.keys(homePriceContextData?.buyerData).length) ||
      (user && Object.keys(user).length)
    ) {
      handleSetLogo();
    }
  }, [
    publicListingData,
    publicQuickQuoteData,
    publicAgentListingData,
    user,
    companyDetails,
    homePriceContextData,
  ]);

  const checkHideCalculator = () => {
    return !hideCalculatorMenu.includes(pathname.split("/")[2]);
  };

  const getLoading = () => {
    if (isRoutePublicListing) {
      return !(publicListingData && Object.keys(publicListingData).length);
    }

    if (isRoutePublicQuickQuote) {
      return !(
        publicQuickQuoteData && Object.keys(publicQuickQuoteData).length
      );
    }

    if (isRoutePublicAgentListing) {
      return !(
        publicAgentListingData && Object.keys(publicAgentListingData).length
      );
    }

    if (isBuyer) {
      // exclude buyer register
      if (pathname.includes("register") || pathname.includes("success")) {
        if (companyDetails?.logo) {
          return loading || childrenloading;
        }

        return companyDetails.loading;
      }

      return !(
        homePriceContextData &&
        Object.keys(homePriceContextData?.buyerData).length
      );
    }

    return loading || childrenloading;
  };

  const calculatorDropdownLabel = (
    <Space className="text-base">
      <span className="text-neutral-1 font-sharp-sans-semibold">
        Calculators
      </span>
      <DownOutlined className="text-xanth" />
    </Space>
  );

  const buyerDropdown = (
    <Dropdown
      menu={{ items: dropdownItems() }}
      overlayClassName="public-calculator"
      trigger={["click"]}
    >
      <a onClick={(e) => e.preventDefault()}>
        <span className="text-neutral-1 font-sharp-sans-semibold hover:text-xanth">
          <SettingFilled className="text-2xl" />
        </span>
      </a>
    </Dropdown>
  );

  const loadingOutlined = (
    <LoadingOutlined
      className="items-center justify-center text-denim text-5xl"
      spin
    />
  );

  const buyerHeader = (
    <Row gutter={[6, 0]} className="justify-end">
      {user?.user && (
        <Col
          sm={22}
          md={22}
          lg={23}
          className="text-end"
          style={{ marginTop: -4 }}
        >
          <span className="font-sharp-sans">{`${user?.user?.first_name} ${user?.user?.last_name}`}</span>
        </Col>
      )}
      <Col sm={2} md={2} lg={1} className="text-end">
        {buyerDropdown}
      </Col>
    </Row>
  );

  const padding = router.pathname.includes("quick-quote")
    ? "pt-5 md:py-5"
    : "py-5";

  return (
    <Spin
      spinning={isSpinning}
      className="max-h-screen"
      indicator={loadingOutlined}
      id="_ant-spin-container_"
    >
      <Layouts className="h-full md:h-screen" id="_layout-wrapper_">
        <Layouts
          className="bg-white navigation-spacing"
          style={{ marginTop: 0 }}
        >
          {!pathname.includes("/buyer/success") && (
            <Header className="w-full flex bg-white px-0 h-full md:h-auto">
              <div
                className={`${padding} bg-white justify-between mx-auto w-full h-full ${
                  isBuyer
                    ? "items-center flex-row"
                    : "flex md:items-center flex-col md:flex-row gap-4"
                }`}
                style={{ maxWidth: "90%" }}
              >
                <Row>
                  <Col span={12}>
                    <div className="leading-none flex flex-1 content-center items-center ">
                      {getLoading() ? (
                        <div className="bg-white flex h-full w-full items-center">
                          <LoadingOutlined className="items-center justify-center text-denim text-2xl" />
                        </div>
                      ) : (
                        <a>
                          <img
                            src={url}
                            alt="company logo"
                            loading="lazy"
                            style={{ maxWidth: isMobileXS ? "200px" : "350px" }}
                            className="object-contain h-20"
                            onClick={() =>
                              (window.location.href = `${
                                isLoggedIn
                                  ? isBuyer
                                    ? "/buyer"
                                    : "/"
                                  : "/login"
                              }`)
                            }
                          />
                        </a>
                      )}
                    </div>
                  </Col>

                  <Col span={12}>
                    {showDropdownMenu(pathname) && buyerHeader}
                  </Col>
                </Row>
              </div>
            </Header>
          )}
          <Content className="overflow-auto bg-white h-full">
            <div
              className={`mx-auto xl:my-0 ${
                !isBuyer ? "h-auto h-full" : "mb-8 mt-3"
              }`}
              style={{ maxWidth: fullwidth ? "100%" : "90%" }}
            >
              {loading || childrenloading ? (
                <div className="bg-white flex h-full w-full justify-center items-center">
                  <LoadingOutlined className="items-center justify-center text-denim text-5xl" />
                </div>
              ) : (
                <>
                  {children}
                  {checkHideCalculator() && (
                    <div
                      id="bottom-options"
                      className="flex flex-row gap-12 items-center justify-center pb-10"
                    >
                      <Dropdown
                        menu={{ items: dropdownItems() }}
                        overlayClassName={`${
                          isBuyer && "buyer-dropdown"
                        } public-calculator`}
                        trigger={["click"]}
                        placement="top"
                      >
                        <a onClick={(e) => e.preventDefault()}>
                          {!isExcludedBuyerRoute &&
                            !isBuyer &&
                            calculatorDropdownLabel}
                        </a>
                      </Dropdown>
                    </div>
                  )}
                </>
              )}
            </div>
          </Content>
          <FooterComponent />
        </Layouts>
      </Layouts>
    </Spin>
  );
};

export default PublicLayout;
