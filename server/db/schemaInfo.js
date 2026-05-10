const mongoose = require("mongoose");

const schemaInfoSchema = new mongoose.Schema({
  __v:             { type: Number },
  load_date_time:  { type: String },
});

module.exports = mongoose.model("SchemaInfo", schemaInfoSchema);
