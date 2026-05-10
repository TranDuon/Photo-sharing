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

/* ════════════════════════════════════════
   GLOBAL MIDDLEWARE
════════════════════════════════════════ */
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Serve static ảnh: GET /images/<filename> */
app.use("/images", express.static(path.join(__dirname, "images")));

/* ════════════════════════════════════════
   ROUTES — phân chia auth / public rõ ràng
════════════════════════════════════════ */

/*
 * PUBLIC — không cần token
 * ─────────────────────────────────────
 * POST /admin/login    → đăng nhập
 * POST /admin/logout   → đăng xuất
 */
app.use("/admin", adminRoutes);

/*
 * /user — xử lý đặc biệt:
 *   POST /user        → đăng ký (public)
 *   POST /user        → đăng ký (public)
 *   GET  /user/*      → cần JWT
 */
app.use("/user", (req, res, next) => {
  if (req.method === "POST" && req.path === "/") return next();
  return requireAuth(req, res, next);
}, userRoutes);

/*
 * Ảnh — tất cả đều cần JWT
 */
app.use("/photosOfUser", requireAuth, publicPhotoRouter);
app.use("/photos",       requireAuth, publicPhotoRouter);
app.use("/photosOfUser", requireAuth, mutationsRouter);
app.use("/photos",       requireAuth, mutationsRouter);
app.use("/commentsOfPhoto", requireAuth, commentRoutes);

/*
 * GET /test/info  → kiểm tra SchemaInfo (protected)
 */
app.get("/test/info", requireAuth, async (req, res) => {
  try {
    const info = await SchemaInfo.findOne({}).lean();
    return res.json(info || { message: "No SchemaInfo. Run: npm run seed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ── 404 ── */
app.use((req, res) => {
  res.status(404).json({ message: `${req.method} ${req.path} not found.` });
});

/* ── Global error handler ── */
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error("Unhandled error:", err);
  res.status(500).json({ message: err.message || "Internal server error." });
});

/* ════════════════════════════════════════
   START SERVER
════════════════════════════════════════ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀  Server at http://localhost:${PORT}`);
      console.log("");
      console.log("  PUBLIC  (no token needed)");
      console.log("    POST  /admin/login");
      console.log("    POST  /user           (register)");
      console.log("    GET   /images/<file>  (static)");
      console.log("");
      console.log("  PROTECTED  (Authorization: Bearer <token>)");
      console.log("    GET   /user/list");
      console.log("    GET   /user/:id");
      console.log("    GET   /photosOfUser/:id");
      console.log("    POST  /photos/new");
      console.log("    PATCH /photos/:photoId");
      console.log("    DELETE /photos/:photoId");
      console.log("    POST  /commentsOfPhoto/:id");
      console.log("    GET   /test/info");
    });
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });
