const express = require("express");
const multer = require("multer");
const router = express.Router();
const lokasiterdekatController = require("../controllers/lokasiterdekatController");

const upload = multer();

router.post(
  "/darat",
  upload.none(),
  lokasiterdekatController.getLokasiTerdekatDarat
);
router.post(
  "/udara",
  upload.none(),
  lokasiterdekatController.getLokasiTerdekatUdara
);
router.post(
  "/daratudara",
  upload.none(),
  lokasiterdekatController.getLokasiTerdekatDaratUdara
);

module.exports = router;
