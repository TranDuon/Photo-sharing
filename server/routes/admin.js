/**
 * routes/admin.js — Final Project (Problem 1)
 *
 * POST /admin/login    → đăng nhập, trả về { token, user }
 * POST /admin/logout   → đăng xuất (kiểm tra header Authorization)
 */
const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("../db/userModel");

/* ══════════════════════════════════════════════════════
   POST /admin/login

   Body:     { login_name, password }
   Success:  200  { token, user: { _id, first_name, last_name, login_name } }
   Error:    400  "Invalid login_name"  |  "Wrong password"  |  "login_name and password required"
══════════════════════════════════════════════════════ */
router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  // Validate input
  if (!login_name || !password) {
    return res.status(400).json("login_name and password are required");
  }

  try {
    // Bước 1: tìm user theo login_name
    const user = await User.findOne({ login_name });

    // Bước 2: không tồn tại
    if (!user) {
      return res.status(400).json("Invalid login_name");
    }

    // Bước 3: so sánh password (bcrypt)
    const match = await bcrypt.compare(password, user.password);

    // Bước 4: sai password
    if (!match) {
      return res.status(400).json("Wrong password");
    }

    // Bước 5: tạo JWT (sống 7 ngày)
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Bước 6: trả về { token, user } — chỉ kèm các field test yêu cầu
    return res.status(200).json({
      token,
      user: {
        _id:        user._id,
        first_name: user.first_name,
        last_name:  user.last_name,
        login_name: user.login_name,
      },
    });

  } catch (err) {
    console.error("POST /admin/login:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

/* ══════════════════════════════════════════════════════
   POST /admin/logout

   Header:   Authorization: Bearer <token>
   Success:  200  "Logged out successfully"
   Error:    400  "Not logged in"

   JWT là stateless → server chỉ xác nhận, client tự xoá token.
══════════════════════════════════════════════════════ */
router.post("/logout", (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json("Not logged in");
  }

  return res.status(200).json("Logged out successfully");
});

module.exports = router;
