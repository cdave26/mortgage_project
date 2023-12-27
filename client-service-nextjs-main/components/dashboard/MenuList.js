const manageUsers = {
  title: "Users",
  description: "Create and manage users in your company.",
  textButton: "View Users",
  url: `/users`,
};

const manageListings = {
  title: "Listings",
  description: "Create and manage SmartView™ Flyers.",
  textButton: "View Listings",
  url: "/listings",
};

const manageQuickQuote = {
  title: "Quick Quote",
  description: "Generate loan scenarios without creating a listing.",
  textButton: "Quick Quote",
  url: "/quick-quote",
};

const manageStateLicenses = {
  title: "My Licenses",
  description: "Manage my state licenses.",
  textButton: "View Licenses",
  url: "/my-state-licenses",
};

const manageFlyers = (user) => {
  return {
    title: "Marketing Flyers",
    description:
      "Create and manage marketing flyers shown to agents and builders.",
    textButton: "View Flyers",
    url: "/marketing-flyers",
  };
};

const manageBuyers = {
  title: "Buyers",
  description: "Provide buyers with their own custom payment search tool.",
  textButton: "View Buyers",
  url: "/buyers",
};

const manageSettings = (user, companyId = null) => {
  /**
   * @TODO update link for company admin to /company/{company_id}
   * retain this condition as this may be changed
   */
  const url = user === "uplist_admin" ? "/company" : `/company/${companyId}`;

  return {
    title: "Company Settings",
    description:
      "Set company information, license, logo, colors, and any additional disclosures.",
    textButton: "View Settings",
    url,
  };
};

export {
  manageUsers,
  manageListings,
  manageQuickQuote,
  manageStateLicenses,
  manageFlyers,
  manageSettings,
  manageBuyers,
};
