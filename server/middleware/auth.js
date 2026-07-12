const { verifyToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: "Authentication required" });
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ detail: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
