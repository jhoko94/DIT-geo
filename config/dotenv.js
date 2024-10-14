require("dotenv").config();
module.exports = {
  upstreamApiAgregator: process.env.UPSTREAM_API_AGREGATOR_URL,
  upstreamApiUrl: process.env.UPSTREAM_API_URL,
  port: process.env.PORT || 5000,
};
