const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // 1. Must be all lowercase 'authorization'
    const authHeader = req.headers.authorization;

    // 2. Safety check: If the header doesn't exist, stop immediately
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "No Authorization header provided" });
    }

    // 3. Split the token safely now that we know authHeader exists
    const parts = authHeader.split(" ");

    // 4. Extract the token (handles both raw token or "Bearer <token>" format)
    const token = parts.length === 2 ? parts[1] : parts[0];

    // 5. Verify the token string against your environment secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 6. Attach the decoded payload to the request object
    req.user = decoded;

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({
      message: "Unauthorized",
      error: error.message,
    });
  }
};
