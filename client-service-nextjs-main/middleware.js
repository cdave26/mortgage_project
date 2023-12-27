/**
 * Copyright (R) 2023, Lanex Corporation
 * This middleware is used to validate the request
 *
 * @project Uplist
 * @since: March 14, 2023
 * @created_time 08:30:30 AM
 * @author: Elmer Alluad Jr.
 */

import { NextResponse } from "next/server";

import validator from "./middleware/validator";

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/pricing",
    "/company/:path*",
    "/users/:path*",
    "/calculators/:path*",
    "/listings/:path*",
    "/quick-quote",
    "/my-state-licenses/:path*",
    "/listing/:path*",
    "/verify-email",
    "/buyers/:path*",
    "/:company*/buyer/register",
    "/buyer/profile",
    "/buyer",
    "/marketing-flyers",
    "/flyers",
    "/price-engine-ob",
    "/:company*/login",
    "/onboarding",
    "/maintenance",

    // WordPress Listings
    "/planet/:path*",
    "/nfmlending/:path*",
    "/mannmortgage/:path*",
    "/upwell/:path*",
    "/demo/:path*",
    "/fimc/:path*",
    "/ffin/:path*",
    "/revolution/:path*",
    "/dml/:path*",
    "/homeseed/:path*",
    "/hometrust/:path*",
    "/lennar/:path*",
    "/luminate/:path*",
    "/momentum/:path*",
    "/mann-mortgage/:path*",
  ],
};

export function middleware(request) {
  return validator(request, NextResponse.next());
}
