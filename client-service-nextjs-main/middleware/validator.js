/**
 * Copyright (R) 2023, Lanex Corporation
 *
 * @project Uplist
 * @since: March 14, 2023
 * @created_time 08:30:30 AM
 * @author: Elmer Alluad Jr.
 */

import { NextResponse } from "next/server";
import * as jose from "jose";
import config from "~/config";
import { parseToken } from "~/lib/parseToken";
import userTypes from "~/enums/userTypes";
import listings from "~/wordpress/listings";

/**
 * validator function  handles the validation of the cookie
 * if cookie is not present redirect to login page
 * if cookie is present redirect to home page
 * this context runs on the server side
 *
 * @param {import('next').NextApiRequest} request
 * @param {import('next').NextApiResponse} response
 */

const routes = []; //dynamic routes for onboarding

const calculator = [
  "/calculators/mortgage-loan",
  "/calculators/rent-vs-own",
  "/calculators/prepayment-savings",
  "/calculators/early-payoff",
  // "/calculators/annual-percentage-rate",
  // `/listing/${url.pathname.split("/")[2]}/${url.pathname.split("/")[3]}`,
];

const prohibitedRoutes = {
  uplist_admin: [],
  company_admin: ["/users/uplist-admin"],
  loan_officer: [
    "/company",
    "/users",
    "/users/uplist-admin",
    "/users/company-admin",
    "/users/loan-officer",
    "/flyers",
    "/price-engine-ob",
  ],
  buyer: [
    "/company",
    "/quick-quote",
    "/users",
    "/users/uplist-admin",
    "/users/company-admin",
    "/users/loan-officer",
    "/marketing-flyers",
    "/flyers",
    "/price-engine-ob",
  ],
};

const restrictedRoutesForCompanyAdmin = [
  "/users/uplist-admin",
  "/company/add",
  "/company",
];

const buyerRegistrationRoute = /^\/[^\/]+\/buyer\/register$/;
const buyerLoginRoute = /^\/[^\/]+\/login$/;

const isPublicRoute = (url) =>
  [
    "/maintenance",
    "/login",
    "/register",
    "/pricing",
    buyerRegistrationRoute,
    buyerLoginRoute,
  ].some((route) => {
    if (typeof route === "object") return route.test(url);
    return url === route;
  });

const isBuyerRoute = (url) =>
  [buyerRegistrationRoute, buyerLoginRoute, "/buyer/profile", "/buyer"].some(
    (route) => {
      if (typeof route === "object") return route.test(url);
      return url === route;
    }
  );

const validator = async (request, response) => {
  const cookie = request.cookies.get("userData");
  const url = request.nextUrl.clone();

  if (process.env.MAINTENANCE_MODE === "true") {
    url.pathname = "/maintenance";
    return NextResponse.rewrite(url);
  }

  const includesListing = ["listing", "listings"].some((listing) =>
    url.pathname.includes(listing)
  );

  if (includesListing) {
    for (const [key, value] of Object.entries(listings)) {
      if (key === url.pathname) {
        url.pathname = value;
        return NextResponse.redirect(new URL(url, request.url));
      }
    }
  }

  const hasCalculatorBaseRoute = url.pathname
    .split("/")
    .includes("calculators");

  // public listing
  if (url.pathname.split("/")[3] && url.pathname.split("/")[4]) {
    calculator.push(
      `/${url.pathname.split("/")[1]}/listing/${url.pathname.split("/")[3]}/${
        url.pathname.split("/")[4]
      }`
    );
  }

  // public quick-quote
  // agent listing
  if (url.pathname.split("/")[1] && url.pathname.split("/")[3]) {
    calculator.push(
      `/${url.pathname.split("/")[1]}/quick-quote/${
        url.pathname.split("/")[3]
      }`,
      `/${url.pathname.split("/")[1]}/agent-listing/${
        url.pathname.split("/")[3]
      }`
    );
  }

  const urlSearchParams = new URLSearchParams(url.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  if (Object.keys(params).length > 0) {
    if (params.res === "verify_email" && params.token) {
      try {
        const { email } = parseToken(params.token);

        if (email) {
          url.pathname = "/verify-email";
          return NextResponse.rewrite(url);
        }
      } catch (error) {
        url.pathname = "/404";
        return NextResponse.rewrite(url);
      }
    }
  }

  if (calculator.includes(url.pathname)) {
    return response;
  }

  if (!cookie) {
    if (isPublicRoute(url.pathname)) {
      return response;
    } else if (params.source === "mail") {
      // created to cater authenticated users with strict sameSite for "userData" cookie
      // redirect to a temporary link to get "userData" cookie
      const prevPath = url.pathname;
      url.search = "";
      url.pathname = "/redirect";
      const response = NextResponse.redirect(url);
      // set temporary cookie to store redirect path
      response.cookies.set({
        name: "tmpRedirect",
        value: prevPath,
        httpOnly: true,
        path: "/",
        maxAge: 15,
        sameSite: "lax",
        secure: true,
      });
      return response;
    } else {
      url.pathname = "/login";
      return NextResponse.redirect(new URL(url, request.url));
    }
  } else {
    if (url.pathname === "/verify-email") {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    if (hasCalculatorBaseRoute && !calculator.includes(url.pathname)) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    const secret = new TextEncoder().encode(config.securityApp);
    const { payload } = await jose.jwtVerify(cookie.value, secret);
    if (
      url.pathname === "/onboarding" &&
      payload.userData.iscomplete_onboarding === 0
    ) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    if (payload.userData.user_type_id === userTypes.BUYER) {
      if (!isBuyerRoute(url.pathname)) {
        url.pathname = "/404";
        return NextResponse.rewrite(url);
      }

      if (
        prohibitedRoutes["loan_officer"].includes(url.pathname) ||
        isPublicRoute(url.pathname)
      ) {
        url.pathname = "/buyer";
        return NextResponse.redirect(new URL(url, request.url));
      }

      return response;
    }

    if (
      isBuyerRoute(url.pathname) &&
      payload.userData.user_type_id !== userTypes.BUYER
    ) {
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }

    if (payload.userData.user_type_id === userTypes.LOAN_OFFICER) {
      /**
       * TODO: clean up restrictedRoutesForLoanOfficer array for the dynamic routes
       */

      const restrictedRoutesForLoanOfficer = [
        "/company",
        "/company/add",
        `/company/view/${url.pathname.split("/")[3]}`,
        `/company/${url.pathname.split("/")[2]}`,
        "/users",
        "/users/add",
        // `/users/view/${url.pathname.split("/")[3]}`,
        // `/users/edit/${url.pathname.split("/")[3]}`,
        "/users/uplist-admin",
        "/users/company-admin",
        "/users/loan-officer",
      ];
      if (restrictedRoutesForLoanOfficer.includes(url.pathname)) {
        url.pathname = "/404";
        return NextResponse.rewrite(url);
      }
    }

    if (payload.userData.user_type_id === userTypes.COMPANY_ADMIN) {
      if (restrictedRoutesForCompanyAdmin.includes(url.pathname)) {
        url.pathname = "/404";
        return NextResponse.rewrite(url);
      }
    }

    /**
     * On boarding
     */

    if (
      [userTypes.COMPANY_ADMIN, userTypes.LOAN_OFFICER].includes(
        payload.userData.user_type_id
      ) &&
      payload.userData.iscomplete_onboarding === 1
    ) {
      const index = routes.findIndex((route) => route === url.pathname);
      if (index === -1) {
        if (url.pathname !== "/onboarding") {
          routes.push(url.pathname);
        }
      }
      if (routes.includes(url.pathname)) {
        url.pathname = "/onboarding";
        return NextResponse.redirect(new URL(url, request.url));
      }
    }

    if (
      prohibitedRoutes[payload.userData.user_type.name].includes(
        url.pathname
      ) ||
      isPublicRoute(url.pathname)
    ) {
      url.pathname = "/";
      return NextResponse.redirect(new URL(url, request.url));
    }
  }

  return response;
};

export default validator;
