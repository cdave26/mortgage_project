const fs = require("fs");
const currentPath = process.env.PWD;

const generateAppVersion = (num) => {
  const ENV_VARIABLES = {
    app_version: num,
  };

  const envContents = `const ENV_VARIABLES = ${JSON.stringify(
    ENV_VARIABLES
  )};\n\nself.ENV = ENV_VARIABLES;`;

  fs.writeFileSync(`${currentPath}/public/env.js`, envContents);
};

const getPubEnvValues = () => {
  try {
    const readEvnjs = fs.readFileSync(`${currentPath}/public/env.js`, {
      encoding: "utf-8",
    });

    const lines = readEvnjs.split("\n");
    const regex = /const\s+ENV_VARIABLES\s*=\s*({[^}]+})/;
    return lines[0].match(regex);
  } catch (err) {
    // Here you get the error when the file was not found,
    // but you also get any other error
    return null;
  }
};

(async () => {
  let numberVersion = 1;
  const match = getPubEnvValues();
  console.log("res:", match);

  if (match) {
    const { app_version } = JSON.parse(match[1]);

    if (app_version) {
      if (app_version >= numberVersion) {
        numberVersion = app_version + 1;
      }
    }
  }
  console.log("ver:", numberVersion);
  generateAppVersion(numberVersion);
})();
