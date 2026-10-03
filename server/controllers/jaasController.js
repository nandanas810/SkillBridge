
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const Session = require("../models/sessionModel");

const createJaasToken = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId || !/^[a-f\d]{24}$/i.test(sessionId)) {
      return res.status(400).json({
        message: "A valid session ID is required",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    const userId = String(req.user.id);
    const senderId = String(session.sender);
    const receiverId = String(session.receiver);

    if (userId !== senderId && userId !== receiverId) {
      return res.status(403).json({
        message: "You are not a participant in this session",
      });
    }

    if (session.status !== "Accepted") {
      return res.status(403).json({
        message: "Only accepted sessions can join a meeting",
      });
    }

    const appId = process.env.JAAS_APP_ID;
    const keyId = process.env.JAAS_KEY_ID;
    const privateKeyPath = path.resolve(
      __dirname,
      "..",
      process.env.JAAS_PRIVATE_KEY_PATH || "./keys/private.pk"
    );

    if (!appId || !keyId || !fs.existsSync(privateKeyPath)) {
      return res.status(500).json({
        message: "JaaS configuration or private key is missing",
      });
    }

    const privateKey = fs.readFileSync(privateKeyPath, "utf8");
    const now = Math.floor(Date.now() / 1000);

    const token = jwt.sign(
      {
        aud: "jitsi",
        iss: "chat",
        sub: appId,
        room: `SkillBridge-${session._id}`,
        iat: now,
        nbf: now - 10,
        exp: now + 60 * 60,
        context: {
          user: {
            id: userId,
            name: req.user.name || "SkillBridge Student",
            email: req.user.email || "",
            moderator: false,
          },
        },
      },
      privateKey,
      {
        algorithm: "RS256",
        keyid: keyId,
      }
    );

    return res.json({
      token,
      roomName: `SkillBridge-${session._id}`,
      appId,
    });
  } catch (error) {
    console.error("JaaS token generation failed:", error.message);

    return res.status(500).json({
      message: "Could not generate meeting token",
    });
  }
};

module.exports = { createJaasToken };
