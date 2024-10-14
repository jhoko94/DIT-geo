const axios = require("axios");
const { upstreamApiAgregator } = require("../config/dotenv");

exports.loginAgregator = async () => {
  try {
    const requestBody = {
      username: "user_test01",
      password: "4ggTest01#141024",
    };

    const response = await axios.post(
      `${upstreamApiAgregator}/aggregator/login`,
      requestBody
    );

    const agregatorToken = response.data.accessToken;
    return agregatorToken;
  } catch (err) {
    console.error(err.message);
  }
};

let agregatorToken = null;
exports.setToken = (token) => {
  agregatorToken = token;
};

exports.getToken = () => {
  return agregatorToken;
};
