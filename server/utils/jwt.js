const jwt = require("jsonwebtoken");

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
}

module.exports = { signToken, verifyToken };
