require("dotenv").config();
module.exports = {
  upstreamApiUrl: process.env.UPSTREAM_API_URL,
  port: process.env.PORT || 5000,
};
