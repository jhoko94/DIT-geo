const axios = require("axios");
const { upstreamApiUrl } = require("../config/dotenv");

exports.getData = async (req, res) => {
  try {
    const response = await axios.get(`${upstreamApiUrl}`);
    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
