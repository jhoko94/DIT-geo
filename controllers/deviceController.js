const pool = require("../config/db");

exports.getDeviceLoc = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tbl_device_loc");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
