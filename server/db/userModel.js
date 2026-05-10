const mongoose = require("mongoose");

/**
 * User schema (Final Project)
 *
 * Profile fields:
 *   first_name, last_name, location, description, occupation
 *
 * Auth fields (mở rộng từ Lab 2):
 *   login_name  String, required, unique
 *   password    String, required (lưu bcrypt hash, KHÔNG plaintext)
 */
const userSchema = new mongoose.Schema({
  first_name:  { type: String, required: true },
  last_name:   { type: String, required: true },
  location:    { type: String },
  description: { type: String },
  occupation:  { type: String },

  /* ── Auth ── */
  login_name:  { type: String, required: true, unique: true },
  password:    { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
