/**
 * middleware/auth.js
 *
 * Kiểm tra JWT trong header:  Authorization: Bearer <token>
 *
 * Nếu hợp lệ  → gán req.userId = decoded.userId  → next()
 * Nếu thiếu   → 401 { message: "No token" }
 * Nếu sai/hết hạn → 401 { message: "Invalid token" }
 */
const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Bước 1: kiểm tra header có tồn tại và đúng định dạng "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token" });
  }

  // Bước 2: tách token ra khỏi chuỗi "Bearer <token>"
  const token = authHeader.split(" ")[1];

  // Bước 3: verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Bước 4: gắn userId vào request để các route handler dùng
    req.userId = decoded.userId;   // { userId, login_name, iat, exp }
    next();

  } catch (err) {
    // Token hết hạn hoặc bị giả mạo/sai chữ ký
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = requireAuth;
