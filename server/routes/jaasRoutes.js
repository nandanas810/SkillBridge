
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { createJaasToken } = require("../controllers/jaasController");

router.post("/token", authMiddleware, createJaasToken);

module.exports = router;
