import {
  bankerBrokerNewYork,
  licenseRegistration,
  licensedRegistered,
  licensedRegisteredNewYork,
  licenseeRegistrantTexas,
} from "./constants";

const radioValuesData = {
  licensee_registrant: {
    Texas: licenseeRegistrantTexas,
  },
  banker_broker: {
    "New York": bankerBrokerNewYork,
  },
  licensed_registered: licensedRegistered,
  license_registration: licenseRegistration,
};

const getRadioValues = (metadata, key, stateName = "") => {
  const functionalKeys = ["licensed_registered", "license_registration"];

  if (!metadata.length) {
    return "";
  }

  const actualKey = key;
  const isLicenseRegistration = key === "license_registration";
  const isLicensedRegistered = key === "licensed_registered";
  const isNewYork = stateName === "New York";

  key =
    isLicenseRegistration || isLicensedRegistered ? "licensee_registrant" : key;

  const selected = metadata[0].validation.filter((val) => val.key === key);

  if (selected.length) {
    const filtered = selected[0].selection.filter((data) => data.checked);
    if (radioValuesData[key] && radioValuesData[key][stateName]) {
      return radioValuesData[key][stateName][filtered[0].value];
    }

    if (functionalKeys.includes(actualKey)) {
      const valueToReturn =
        isLicenseRegistration && isNewYork
          ? licensedRegisteredNewYork[filtered[0].value]
          : radioValuesData[actualKey][filtered[0].value];

      return valueToReturn;
    }

    return filtered[0].value;
  }

  return "";
};

const constructCompanyAddress = (company) => {
  const { address, city, state, zip } = company;
  return `${address} ${city}, ${state} ${zip}`;
};

const getBranchAddress = (metadata, company) => {
  if (!metadata.length) {
    return "";
  }

  const selected = metadata[0].validation.filter(
    (val) => val.key === "branch_address"
  );

  if (selected.length) {
    const mapped = selected[0].selection.map((data) => data.value);
    return `${mapped[0]} ${mapped[1]}, ${mapped[2]}`;
  }

  return constructCompanyAddress(company);
};

export const checkAdditionalConditions = (data) => {
  const {
    state: { name: stateName },
    state_metadata,
  } = data;
  const stateMetadata = JSON.parse(state_metadata);
  const listingStateMetadata = stateMetadata.filter(
    (state) => state.name === stateName
  );

  const lenderBrokerStates = ["Connecticut", "Massachusetts"];
  if (lenderBrokerStates.includes(stateName)) {
    return getRadioValues(listingStateMetadata, "lender_broker") === "Broker";
  }

  if (stateName === "Texas") {
    return (
      getRadioValues(listingStateMetadata, "licensee_registrant") === "Licensee"
    );
  }

  return true;
};

const getCompanyLoanOfficerMobile = (data) => {
  const {
    company: { company_mobile_number },
    user: { mobile_number },
  } = data;

  return company_mobile_number ?? mobile_number;
};

const getCADepartmentChoice = (metadata) => {
  if (!metadata.length) {
    return "";
  }

  const selected = metadata[0].validation.filter(
    (val) => val.key === "california_options"
  );

  if (selected.length) {
    const mapped = selected[0].selection
      .filter((data) => data.checked)
      .map((data) => {
        return `Department of ${data.full_title}`;
      });

    return mapped.join(", ");
  }
};

const checkStateAddOns = (
  companyNmlsNum,
  stateName,
  companyStateLicense,
  metadata
) => {
  if (!metadata.length) {
    return companyNmlsNum;
  }

  if (stateName === "California") {
    // check if the Dept. of Real Estate is also selected
    const filtered = metadata[0].validation[0].selection.filter(
      (data) => data.value === "Dept real estate" && data.checked
    );

    if (filtered.length) {
      return `${companyNmlsNum} and under state license number ${companyStateLicense}`;
    }
  }

  return companyNmlsNum;
};

export const parseDisclaimerParagraphs = (display, data) => {
  const {
    user: { first_name, last_name, nmls_num, mobile_number },
    state: { name: stateName },
    company,
    state_metadata,
    company_state_license,
    license: { license: user_state_license },
  } = data;

  const {
    company_mobile_number,
    company_nmls_number,
    name: companyName,
  } = company;

  const stateMetadata = JSON.parse(state_metadata);
  const listingStateMetadata = stateMetadata.filter(
    (state) => state.name === stateName
  );

  // You may notice that there might be duplicate keys
  // but when you look closer you will see a difference
  const replaceable = {
    // LO information
    "{mlo_name}": `${first_name} ${last_name}`,

    "{mlo_nmls_id}.": `${nmls_num}.`,
    "{mlo_nmls_id}": nmls_num,

    "{mlo_state_license_number}": user_state_license,
    "{mlo_state_license_number}.": `${user_state_license}.`,

    "{mlo_address}": getBranchAddress(listingStateMetadata, company),
    "{mlo_address}.": `${getBranchAddress(listingStateMetadata, company)}.`,
    "{mlo_address},": `${getBranchAddress(listingStateMetadata, company)},`,

    "{mlo_mobile_number}": mobile_number,
    "{mlo_mobile_number}.": `${mobile_number}.`,

    // company information
    "{nmls_id}": company_nmls_number,
    "{nmls_id}.": `${company_nmls_number}.`,

    "{company_nmls_id}": company_nmls_number,
    "{company_nmls_id}.": `${checkStateAddOns(
      company_nmls_number,
      stateName,
      company_state_license,
      listingStateMetadata
    )}.`,

    "{state_license_number}": company_state_license,
    "{state_license_number}.": `${company_state_license}.`,
    "{state_license_number},": `${company_state_license},`,

    "{company_mobile_number}": company_mobile_number,
    "{company_mobile_number}.": `${company_mobile_number}.`,

    "{company_name}": companyName,
    "{company_name}.": `${companyName}.`,
    "{company_name},": `${companyName},`,

    "{company_mlo_mobile}": getCompanyLoanOfficerMobile(data),
    "{company_mlo_mobile}.": `${getCompanyLoanOfficerMobile(data)}.`,

    "{company_address}": constructCompanyAddress(company),
    "{company_address}.": `${constructCompanyAddress(company)}.`,
    "{company_address},": `${constructCompanyAddress(company)},`,

    "{license_registration}": getRadioValues(
      listingStateMetadata,
      "license_registration",
      stateName
    ),
    "{license_registration}.": `${getRadioValues(
      listingStateMetadata,
      "license_registration",
      stateName
    )}.`,
    "{licensed_registered}": getRadioValues(
      listingStateMetadata,
      "licensed_registered"
    ),

    // listing information
    "{state_name}": stateName,

    // get radio values
    "{banker_broker}": getRadioValues(
      listingStateMetadata,
      "banker_broker",
      stateName
    ),
    "{lender_broker}": getRadioValues(
      listingStateMetadata,
      "lender_broker",
      stateName
    ),
    "{licensee_registrant}.": `${getRadioValues(
      listingStateMetadata,
      "licensee_registrant",
      stateName
    )}.`,
    "{licensee_registrant}": getRadioValues(
      listingStateMetadata,
      "licensee_registrant",
      stateName
    ),
    "{servicer_lender_broker}": getRadioValues(
      listingStateMetadata,
      "servicer_lender_broker",
      stateName
    ),
    "{lender_broker_depository}": getRadioValues(
      listingStateMetadata,
      "lender_broker_depository",
      stateName
    ),
    "{banker_broker_servicer}": getRadioValues(
      listingStateMetadata,
      "banker_broker_servicer",
      stateName
    ),

    // todo: no components yet
    "{licensee_broker}": getRadioValues(
      listingStateMetadata,
      "licensee_broker"
    ),
    "{lender_broker_dual}": getRadioValues(
      listingStateMetadata,
      "lender_broker_dual"
    ),
    "{company_banker}": getRadioValues(listingStateMetadata, "company_banker"),
    "{originator_company}": getRadioValues(
      listingStateMetadata,
      "originator_company"
    ),

    "{department_choice}": `${getCADepartmentChoice(
      listingStateMetadata,
      company_state_license
    )}`,

    // TODO: CONTINUE mapping for these values if it is finalized
    // (Indiana) {dfi_secstate} = Insert Department of Financial Institutions or Secretary of State
    // (Iowa) {banker_registrant_broker_mlc} = Insert Mortgage Banker, Mortgage Banker Registrant, Mortgage Broker, or Master Loan Company
    // (Kansas) {mc_sl} = Insert Mortgage Company or Supervised Loan)
    // (Michigan) - too many to mention
    // (Utah) {notification_license} {notification_license_number}
    // (Washington) {loan_company_broker}
  };

  return display
    .split(" ")
    .map((str) => {
      const trimmed = str.trim(); // remove whitespaces
      return Object.keys(replaceable).includes(trimmed)
        ? replaceable[trimmed]
        : trimmed;
    })
    .join("|")
    .replace(/\|/g, " ");
};
