const express = require("express");
const multer = require("multer");
const router = express.Router();
const dataFromAgregator = require("../controllers/dataFromAgregator");

const upload = multer();

router.post(
  "/FindDevicebyLatLon",
  upload.none(),
  dataFromAgregator.FindDevicebyLatLon
);
router.post(
  "/FindDevicebyLatLonDarat",
  upload.none(),
  dataFromAgregator.FindDevicebyLatLonDarat
);
router.post(
  "/FindDevicebyLatLonUdara",
  upload.none(),
  dataFromAgregator.FindDevicebyLatLonUdara
);

module.exports = router;
