const next = require('next');
const { envReader, normalizePort } = require('./helper/helper');

envReader();

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.APP_HOSTNAME || 'localhost';
const port = normalizePort(process.env.APP_PORT || 3000);

const app = next({ dev, hostname, port });

module.exports = app;
