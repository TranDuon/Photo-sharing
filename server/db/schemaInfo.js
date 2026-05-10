const mongoose = require("mongoose");

/**
 * SchemaInfo schema
 *
 * Dùng để kiểm tra trạng thái schema / thời điểm load dữ liệu.
 *
 * Fields:
 *   _id            ObjectId  (tự động)
 *   __v            Number
 *   load_date_time String
 */
const schemaInfoSchema = new mongoose.Schema({
  __v:             { type: Number },
  load_date_time:  { type: String },
});

module.exports = mongoose.model("SchemaInfo", schemaInfoSchema);
