/**
 * routes/user.js — Final Project
 *
 *   GET  /user/list   → danh sách users (chỉ _id, first_name, last_name)
 *   GET  /user/:id    → chi tiết user   (không trả password, login_name)
 *   POST /user        → đăng ký user mới (Problem 4)
 */
const router   = require("express").Router();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const User     = require("../db/userModel");

/* ══════════════════════════════════════════
   GET /user/list
══════════════════════════════════════════ */
router.get("/list", async (req, res) => {
  try {
    const users = await User
      .find({})
      .select("_id first_name last_name")
      .lean();
    return res.status(200).json(users);
  } catch (err) {
    console.error("GET /user/list:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

/* ══════════════════════════════════════════
   GET /user/:id
══════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(`User not found with id: ${id}`);
  }

  try {
    const user = await User
      .findById(id)
      .select("_id first_name last_name location description occupation")
      .lean();

    if (!user) {
      return res.status(400).json(`User not found with id: ${id}`);
    }
    return res.status(200).json(user);
  } catch (err) {
    console.error("GET /user/:id:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

/* ══════════════════════════════════════════════════════
   POST /user — đăng ký user mới (Problem 4)

   Body: { login_name, password, first_name, last_name,
           location, description, occupation }

   Validation (mỗi field check riêng → message lỗi cụ thể):
     - login_name : required, không trùng
     - password   : required, tối thiểu 6 ký tự
     - first_name : required, không rỗng
     - last_name  : required, không rỗng
     - location, description, occupation : optional

   Success: 201 { login_name }
   Error:   400 "<chuỗi mô tả lỗi cụ thể>"
══════════════════════════════════════════════════════ */
router.post("/", async (req, res) => {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = req.body;

  /* ── Validate từng field ── */
  if (!login_name || !login_name.trim()) {
    return res.status(400).json("login_name is required");
  }
  if (!password || password.length === 0) {
    return res.status(400).json("password is required");
  }
  if (password.length < 6) {
    return res.status(400).json("password must be at least 6 characters");
  }
  if (!first_name || !first_name.trim()) {
    return res.status(400).json("first_name is required");
  }
  if (!last_name || !last_name.trim()) {
    return res.status(400).json("last_name is required");
  }

  try {
    /* ── Check login_name trùng ── */
    const existing = await User.findOne({ login_name }).lean();
    if (existing) {
      return res.status(400).json(`login_name '${login_name}' already exists`);
    }

    /* ── Hash password trước khi lưu ── */
    const hash = await bcrypt.hash(password, 10);

    /* ── Tạo user mới ── */
    const newUser = await User.create({
      login_name: login_name.trim(),
      password:   hash,
      first_name: first_name.trim(),
      last_name:  last_name.trim(),
      location:    location    ?? "",
      description: description ?? "",
      occupation:  occupation  ?? "",
    });

    /* ── Trả về login_name (theo yêu cầu test) ── */
    return res.status(201).json({ login_name: newUser.login_name });

  } catch (err) {
    // Backup: nếu unique index trong DB raise duplicate key
    if (err.code === 11000) {
      return res.status(400).json(`login_name '${login_name}' already exists`);
    }
    console.error("POST /user:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

module.exports = router;
