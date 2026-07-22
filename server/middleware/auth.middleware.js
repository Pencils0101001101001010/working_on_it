// @ts-nocheck
import jwt from "jsonwebtoken";

export default (req, res, next) => {
  try {
    let token = null;

    // 1. Check if the token is arriving via the Authorization Header (Bearer Token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Fallback: Check if the token is inside cookies (Standard browser call)
    if (!token && req.cookies) {
      token = req.cookies.authToken;
    }

    // 3. Stop immediately if the token is entirely missing
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing. Please log in." });
    }

    // 4. Verify the token string against your environment secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Attach the decoded payload safely (supporting multiple key variations)
    req.user = {
      ...decoded,
      userId: decoded.userId, // Matches your existing notes controller logic (req.user.userId)
      id: decoded.userId, // Fallback for safety across other routes
      _id: decoded.userId, // Fallback for safety across other routes
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({
      message: "Unauthorized or session expired",
      error: error.message,
    });
  }
};
