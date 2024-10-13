const express = require("express");
const router = express.Router();
const deviceController = require("../controllers/deviceController");

router.get("/loc", deviceController.getDeviceLoc);

module.exports = router;
