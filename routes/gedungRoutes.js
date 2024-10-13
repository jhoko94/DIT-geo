const express = require("express");
const router = express.Router();
const gedungController = require("../controllers/gedungController");

router.get("/", gedungController.getGedung);

module.exports = router;
