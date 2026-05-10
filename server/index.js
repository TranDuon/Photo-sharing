require("dotenv").config();

const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const path       = require("path");

const adminRoutes    = require("./routes/admin");
const userRoutes     = require("./routes/user");
const { publicPhotoRouter, mutationsRouter } = require("./routes/photo");
const commentRoutes  = require("./routes/comment");
const SchemaInfo     = require("./db/schemaInfo");
const requireAuth    = require("./middleware/auth");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/admin", adminRoutes);

app.use("/user", (req, res, next) => {
  if (req.method === "POST" && req.path === "/") return next();
  return requireAuth(req, res, next);
}, userRoutes);

app.use("/photosOfUser", requireAuth, publicPhotoRouter);
app.use("/photos",       requireAuth, publicPhotoRouter);
app.use("/photosOfUser", requireAuth, mutationsRouter);
app.use("/photos",       requireAuth, mutationsRouter);
app.use("/commentsOfPhoto", requireAuth, commentRoutes);

app.get("/test/info", requireAuth, async (req, res) => {
  try {
    const info = await SchemaInfo.findOne({}).lean();
    return res.json(info || { message: "No SchemaInfo. Run: npm run seed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `${req.method} ${req.path} not found.` });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error." });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
