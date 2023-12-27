export const downloadCSV = (csv, filename) => {
  let csvFile;
  let href;
  csvFile = new Blob([csv], { type: "octet-stream" });
  href = URL.createObjectURL(csvFile);
  const a = Object.assign(document.createElement("a"), {
    href,
    style: "display: none",
    download: filename,
  });
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(href);
  document.body.removeChild(a);
};

const convertCommaToSpace = (str) => {
  if (typeof str === "string") {
    return str.replace(/,/g, " ");
  }
  return str;
};

const getSelected = (selection) => {
  if (selection.key === "branch_address") {
    return selection.selection.map(
      (x) =>
        `Branch ${convertCommaToSpace(x.full_title)}: ${convertCommaToSpace(
          x.value
        )}`
    );
  } else {
    return selection.selection
      .filter((x) => x.checked)
      .map((x) => convertCommaToSpace(x.full_title));
  }
};

const mapMetadata = (license) => {
  const filtered = license.state_metadata.filter(
    (metadata) => metadata.name === license.state.name
  );

  if (!filtered.length) return "";

  return filtered.map((metadata) => {
    const validationReturn = metadata.validation
      .map((x) => {
        if (x.name === "Branch Address") {
          return getSelected(x).join("; ");
        }
        return `${convertCommaToSpace(x.name)}: ${getSelected(x).join("; ")}`;
      })
      .join("; ");

    return `${validationReturn}`;
  });
};

const mapCompanyStateLicense = (obj) => {
  const stateLicense = obj["Company State Licenses"];
  if (!stateLicense.length) return "";

  const mapped = stateLicense
    .map((lic) => {
      const mapped = mapMetadata(lic);

      if (mapped) {
        return [
          `State: ${lic.state.name}`,
          `License: ${lic.license}`,
          `Metadata: ${mapped}`,
        ].join(" / ");
      }

      return [`State: ${lic.state.name}`, `License: ${lic.license}`].join(
        " / "
      );
    })
    .join(" | ");

  obj["Company State Licenses"] = mapped;
};

/**
 * Export CSV
 * @param {String} name - Name of file
 * @param {Array}  data - Array of data
 * @returns {void}
 */
export const exportCSV = (data, name, fromCompany = false) => {
  if (name === "") {
    throw new Error("name is empty");
  }

  if (typeof name !== "string") {
    throw new Error("name is not a string");
  }

  if (typeof data !== "object") {
    throw new Error("data is not an object");
  }

  if (data.length === 0) {
    throw new Error("data is empty");
  }

  //trim the commas from the data so it doesn't create new columns
  function removeCommasFromObject(obj) {
    for (let key in obj) {
      if (typeof obj[key] === "string") {
        obj[key] = obj[key].replace(/,/g, "");
      }
    }
  }

  for (let i = 0; i < data.length; i++) {
    removeCommasFromObject(data[i]);
    if (fromCompany) {
      mapCompanyStateLicense(data[i]);
    }
  }

  const separator = ",";
  const keys = Object.keys(data[0]);

  let csvHeader = keys.join(separator);
  const csvRows = data.map((obj) =>
    keys.map((key) => obj[key]).join(separator)
  );

  downloadCSV([csvHeader, ...csvRows].join("\n"), `${name}.csv`);
};
