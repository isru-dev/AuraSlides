const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  try {
    // 1. Check if the Authorization header exists and starts with "Bearer"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: "Access denied. No valid token format provided." 
      });
    }

    // 2. Extract the raw token string (remove the word "Bearer ")
    const token = authHeader.split(' ')[1];

    // 3. MATHEMATICAL VERIFICATION (The Magic Line)
    // This takes the token, extracts the header/payload, blends it with 
    // your secret key, and confirms the signature matches.
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the decoded user data (userId, email) to the req object
    // This makes the logged-in user's info available inside your routes!
    req.user = decodedPayload;

    // 5. Everything checks out! Move to the actual route logic safely.
    next();

  } catch (err) {
    // If the token is fake, edited by a hacker, or expired, jwt.verify() fails immediately
    return res.status(401).json({ 
      success: false, 
      message: "Invalid, tampered, or expired token.", 
      error: err.message 
    });
  }
};

module.exports = protect;
