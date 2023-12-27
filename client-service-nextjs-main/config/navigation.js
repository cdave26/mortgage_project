const homeNav = {
  label: "Home",
  iconName: "homeIcon",
  listing: [],
  downIcon: null,
  link: "/",
};

const listingNav = {
  label: "Listings",
  iconName: "listingsIcon",
  listing: [],
  downIcon: null,
  link: "/listings",
};

const licenseNav = {
  label: "My Licenses",
  iconName: "stateLicenseIcon",
  listing: [],
  downIcon: null,
  link: "/my-state-licenses",
};

const companyNav = {
  label: "Company Settings",
  iconName: "companyIcon",
  listing: [],
  downIcon: null,
  link: "/company",
};

const quickQuoteNav = {
  label: "Quick Quote",
  iconName: "rateProviderIcon",
  listing: [],
  downIcon: null,
  link: "/quick-quote",
};

const preApprovedBuyers = {
  label: "Buyers",
  iconName: "preApprovedBuyersIcon",
  listing: [],
  downIcon: null,
  link: "/buyers",
};

const userNav = (subMenu) => {
  return {
    key: "users",
    label: "Users",
    iconName: "userIcon",
    listing: subMenu,
  };
};

const managementNav = (subMenu) => {
  return {
    key: "management",
    label: "Management",
    iconName: "managementIcon",
    listing: subMenu,
  };
};

const mortgageRateNav = {
  label: "Mortgage Rate",
  iconName: "mortgageRateIcon",
  listing: [],
};

const calculatorNav = (subMenu) => {
  return {
    key: "calculators",
    label: "Calculators",
    iconName: "calculatorIcon",
    listing: subMenu,
  };
};

const reportsNav = {
  label: "Reports",
  iconName: "reportsIcon",
  listing: [],
  downIcon: null,
};

const marketingFlyersNav = {
  label: "Marketing Flyers",
  iconName: "marketingFlyerIcon",
  link: "/marketing-flyers",
  downIcon: null,
  listing: [],
};

const flyerMangementNav = {
  label: "Flyer Database",
  iconName: "flyerManagementIcon",
  listing: [],
  link: "/flyers",
  downIcon: null,
};

const priceEngineOBNav = {
  label: "Price Engine (Optimal Blue)",
  iconName: "priceEngineIcon",
  listing: [],
  link: "/price-engine-ob",
  downIcon: null,
};

const contactSupportNav = {
  label: "Uplist Help Center",
  iconName: "contactSupportIcon",
  link: "https://help.getuplist.net/",
  isUrl: true,
  downIcon: null,
  listing: [],
};

const viewProfileNav = {
  label: "View Profile",
  iconName: "contactSupportIcon",
  link: null,
  downIcon: null,
  listing: [],
};

export {
  homeNav,
  listingNav,
  licenseNav,
  companyNav,
  quickQuoteNav,
  preApprovedBuyers,
  userNav,
  managementNav,
  mortgageRateNav,
  calculatorNav,
  reportsNav,
  marketingFlyersNav,
  flyerMangementNav,
  priceEngineOBNav,
  contactSupportNav,
  viewProfileNav,
};
