const pool = require("../config/db");

exports.getGedung = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tbl_gedung");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
