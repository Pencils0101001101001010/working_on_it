// @ts-nocheck
import jwt from "jsonwebtoken";

export default (req, res, next) => {
  try {
    // 1. Read the token directly from the cookies object
    const token = req.cookies ? req.cookies.authToken : null;

    // 2. Stop immediately if the cookie is missing
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token missing. Please log in." });
    }

    // 3. Verify the token string against your environment secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded payload (e.g., { userId: "..." }) to the request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({
      message: "Unauthorized or session expired",
      error: error.message,
    });
  }
};
