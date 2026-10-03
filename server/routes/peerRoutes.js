const express = require("express");
const router = express.Router();
const { createPeer, getAllPeers, getMyPeer, updateMyPeer, ratePeer } = require("../controllers/peerController");
const authMiddleware = require("../middleware/authMiddleware");

// Compatibility route name: UI calls these users "peers".
router.get("/", authMiddleware, getAllPeers);
router.get("/me", authMiddleware, getMyPeer);
router.post("/", authMiddleware, createPeer);
router.put("/me", authMiddleware, updateMyPeer);
router.post("/:id/rate", authMiddleware, ratePeer);

module.exports = router;
