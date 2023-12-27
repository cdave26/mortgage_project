/**
 * FRONTEND CONFIG
 */
import {
  companyAdminSideBar,
  loanOfficerSideBar,
  uplistAdminSideBar,
} from "~/store/ui/type";

export default {
  marketingUrl: process.env.UPLIST_MARKETING_URL,
  privacyPolicyUrl: process.env.UPLIST_PRIVACY_POLICY_URL,
  termsOfServiceUrl: process.env.UPLIST_TOS_URL,
  securityApp: process.env.SECURITY_APP,
  appUrl: process.env.REACT_APP_URL,
  serviceUrl: process.env.REACT_APP_API_SERVICE_URL,
  storagePath:
    process.env.API_STORAGE_ENV === "public"
      ? `${process.env.REACT_APP_API_SERVICE_URL}/storage/`
      : `${process.env.STORAGE_URL}/`,
  awsStorageUrl: process.env.STORAGE_URL,
  ngrokConnection: process.env.NGROK_CONNECTION,
  pusherWS: process.env.PUSHER_WS,
  pusherKey: process.env.PUSHER_KEY,
  pusherWshost: process.env.PUSHER_WSHOST,
  pusherCluster: process.env.PUSHER_CLUSTER,
  pusherPort: process.env.PUSHER_PORT,
  stripe: {
    pricing: {
      pricing1: process.env.STRIPE_PRICING_1,
      pricing2: process.env.STRIPE_PRICING_2,
      pricing3: process.env.STRIPE_PRICING_3,
      specialLaunchPrice: process.env.STRIPE_PRICING_SPECIAL,
    },
  },
  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY,
  },
  renderSideBarMenu: {
    uplist_admin: uplistAdminSideBar,
    company_admin: companyAdminSideBar,
    loan_officer: loanOfficerSideBar,
  },
  requiredRule: [
    { required: true, message: "This field is required." },
    { whitespace: true, message: "This field is required." },
  ],
  urlRule: [
    {
      pattern:
        "^((http|https)://)[-a-zA-Z0-9@:%._\\+~#?&//=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%._\\+~#?&//=]*)$",
      message: "Please include 'https://' before the URL.",
    },
  ],
  lookupLinks: {
    usda_lookup:
      "https://eligibility.sc.egov.usda.gov/eligibility/welcomeAction.do?pageAction=sfp",
    fha_condo_lookup: "https://entp.hud.gov/idapp/html/condlook.cfm",
    va_condo_lookup: "https://lgy.va.gov/lgyhub/condo-report",
  },
  ob_strategy: {
    min_price: 90,
    max_price: 105,
  },
  changesOfTheForm: {
    title: "You are about to discard some changes",
    content:
      "You have made some changes. Are you sure that you want to discard changes from this form? You will lose all the changes you made.",
    button: `Don't Save`,
  },
};
