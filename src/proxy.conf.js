// ---------------------------------------
// Email: xyz@pqr.com
// Templates: /templates
// (c) 2024 /mit-license
// ---------------------------------------

const { env } = require('process');

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
  // env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7085';   //Ketan
  env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'http://127.0.0.1:5000/api';
const PROXY_CONFIG = [
  {
    context: [
      "/api",
      "/swagger",
      "/connect",
      "/oauth",
      "/.well-known"
    ],
    target,
    secure: false
  }
]

module.exports = PROXY_CONFIG;
