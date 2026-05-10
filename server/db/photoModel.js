const mongoose = require("mongoose");

/**
 * Comment sub-document (embedded inside Photo)
 *
 * Fields:
 *   _id       ObjectId  (tự động)
 *   comment   String    (required)
 *   date_time Date      (default: Date.now)
 *   user_id   ObjectId  (ref: 'User', required)
 */
const commentSchema = new mongoose.Schema({
  comment:   { type: String,                                   required: true },
  date_time: { type: Date,   default: Date.now                               },
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

/**
 * Photo schema
 *
 * Fields:
 *   _id       ObjectId   (tự động)
 *   user_id   ObjectId   (ref: 'User', required)
 *   file_name String     (required)
 *   caption   String     (mô tả bài đăng, optional)
 *   date_time Date       (default: Date.now)
 *   comments  [Comment]  (array of embedded comment objects)
 */
const photoSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  file_name: { type: String, required: true },
  caption:   { type: String, default: "" },
  date_time: { type: Date,   default: Date.now },
  comments:  [commentSchema],
});

module.exports = mongoose.model("Photo", photoSchema);
