import {
  calculatorNav,
  companyNav,
  homeNav,
  licenseNav,
  listingNav,
  // managementNav,
  quickQuoteNav,
  preApprovedBuyers,
  userNav,
  reportsNav,
  marketingFlyersNav,
  flyerMangementNav,
  priceEngineOBNav,
  contactSupportNav,
  viewProfileNav,
} from "~/config/navigation";

import {
  calcAPR,
  calcEarlyPayoff,
  calcMortgageLoan,
  calcPrepaymentSavings,
  calcRentVsOwn,
} from "~/config/sub-menu.js/CalculatorSubMenu";

// import {
//   managementFlyer,
//   managementPriceEngine,
// } from "~/config/sub-menu.js/ManagementSubMenu";

import {
  userCompanyAdmin,
  userLoanOfficer,
  userUplistAdmin,
} from "~/config/sub-menu.js/UserSubMenu";

// const managementSubNav = [managementFlyer, managementPriceEngine];

export const UI = {
  snackbars: "UI/snackbars",
  modal: "UI/modal",
  sideBarMenu: "UI/sidebarMenu",
  isRendered: "UI/isRendered",
  isSpinning: "UI/isSpinning",
  stepper: "UI/stepper",
  formChange: "UI/formChange",
};

export const uplistAdminSideBar = [
  homeNav,
  listingNav,
  quickQuoteNav,
  preApprovedBuyers,
  marketingFlyersNav,
  licenseNav,
  companyNav,
  flyerMangementNav,
  priceEngineOBNav,
  userNav([userCompanyAdmin, userUplistAdmin, userLoanOfficer]),
  // managementNav([]),
  calculatorNav([
    calcMortgageLoan,
    calcEarlyPayoff,
    calcPrepaymentSavings,
    calcRentVsOwn,
    // calcAPR,
  ]),
  reportsNav,
  contactSupportNav,
  viewProfileNav,
];

export const companyAdminSideBar = [
  homeNav,
  listingNav,
  quickQuoteNav,
  preApprovedBuyers,
  marketingFlyersNav,
  licenseNav,
  companyNav,
  flyerMangementNav,
  priceEngineOBNav,
  userNav([userCompanyAdmin, userLoanOfficer]),
  // managementNav(managementSubNav),
  calculatorNav([
    calcMortgageLoan,
    calcEarlyPayoff,
    calcPrepaymentSavings,
    calcRentVsOwn,
    // calcAPR,
  ]),
  contactSupportNav,
  viewProfileNav,
];

export const loanOfficerSideBar = [
  homeNav,
  listingNav,
  quickQuoteNav,
  preApprovedBuyers,
  marketingFlyersNav,
  licenseNav,
  // managementNav([managementFlyer]),
  calculatorNav([
    calcMortgageLoan,
    calcEarlyPayoff,
    calcPrepaymentSavings,
    calcRentVsOwn,
    // calcAPR,
  ]),
  contactSupportNav,
  viewProfileNav,
];
