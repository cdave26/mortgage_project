const fs = require('fs');
const path = require('path');

const parser = (data) => {
  const obj = {};
  const lines = data.split('\n').map((line) => line.replace(/['"]+/g, ''));

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith('#')) {
      continue;
    }
    const [key, value] = trimmed.split('=');
    obj[key] = value;
  }

  return obj;
};

/**
 * @description - This function reads the .env file and sets the environment variables
 * @returns {void}
 */
const envReader = () => {
  try {
    const evnPath = path.resolve(process.cwd(), '.env');
    const encoding = 'utf8';
    if (fs.existsSync(evnPath)) {
      const data = parser(fs.readFileSync(evnPath, { encoding }));

      Object.keys(data).forEach((key) => {
        if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
          process.env[key] = data[key];
        }
      });
    }
  } catch (error) {
    console.log(error.getMessage());
  }
};

/**
 * @description - This function normalizes the port
 * @param {number} val
 * @returns  {number | boolean} - returns the port number or false
 */

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

module.exports = {
  envReader,
  normalizePort,
};
