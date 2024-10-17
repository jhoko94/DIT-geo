const express = require("express");
const multer = require("multer");
const router = express.Router();
const gedungController = require("../controllers/gedungController");

const upload = multer();

router.get("/", upload.none(), gedungController.getGedung);

module.exports = router;
