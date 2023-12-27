#!/usr/bin/env node
const app = require('../app');
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const url = require('url');
const { envReader, normalizePort } = require('../helper/helper');
envReader();
const numCPUs = os.cpus().length;

const port = normalizePort(process.env.APP_PORT || 3000);

const handle = app.getRequestHandler();

app.prepare().then(() => {
  if (cluster.isPrimary || cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('fork', (worker) => {
      console.log(`Worker ${worker.process.pid} is forked`);
    });

    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
    });

    cluster.on('listening', (worker, address) => {
      console.log(
        `Worker ${worker.process.pid} is now connected to ${
          address.address ? address.address : process.env.APP_HOSTNAME
        }:${address.port}`
      );
    });

    cluster.on('disconnect', (worker) => {
      console.log(`Worker ${worker.process.pid} has disconnected`);
    });

    cluster.on('error', (worker, code, signal) => {
      console.log(
        `Worker ${worker.process.pid} has died with signal ${signal}`
      );
      cluster.fork();
    });

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    http
      .createServer(async (req, res) => {
        try {
          const parsedUrl = url.parse(req.url, true);

          await handle(req, res, parsedUrl);
        } catch (error) {
          req.statusCode = 500;
          req.end('Internal Server Error');
        }
      })
      .listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on ${process.env.APP_HOSTNAME}:${port}`);
      });
  }
});
