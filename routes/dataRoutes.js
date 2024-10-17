const express = require("express");
const multer = require("multer");
const router = express.Router();
const dataController = require("../controllers/dataController");

const upload = multer();

router.get("/", upload.none(), dataController.getData);

module.exports = router;
