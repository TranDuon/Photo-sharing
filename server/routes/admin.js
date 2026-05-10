const router  = require("express").Router();
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const User    = require("../db/userModel");

router.post("/login", async (req, res) => {
  const { login_name, password } = req.body;

  if (!login_name || !password) {
    return res.status(400).json("login_name and password are required");
  }

  try {
    const user = await User.findOne({ login_name });

    if (!user) {
      return res.status(400).json("Invalid login_name");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json("Wrong password");
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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

router.post("/logout", (req, res) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json("Not logged in");
  }

  return res.status(200).json("Logged out successfully");
});

module.exports = router;
