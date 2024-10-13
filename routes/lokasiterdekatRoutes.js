const express = require("express");
const router = express.Router();
const lokasiterdekatController = require("../controllers/lokasiterdekatController");

router.post("/darat", lokasiterdekatController.getLokasiTerdekatDarat);
router.post("/udara", lokasiterdekatController.getLokasiTerdekatUdara);
router.post(
  "/daratudara",
  lokasiterdekatController.getLokasiTerdekatDaratUdara
);

module.exports = router;
