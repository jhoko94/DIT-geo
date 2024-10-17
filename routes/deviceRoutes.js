const express = require("express");
const multer = require("multer");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

const upload = multer();

router.get("/loc", upload.none(), deviceController.getDeviceLoc);

module.exports = router;
