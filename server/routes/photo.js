const publicPhotoRouter = require("express").Router();
const mutationsRouter   = require("express").Router();
const mongoose = require("mongoose");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");
const { v4: uuidv4 } = require("uuid");

const Photo = require("../db/photoModel");
const User  = require("../db/userModel");

async function formatPhotoForResponse(photo) {
  const p = photo.toObject ? photo.toObject() : photo;
  const comments = await Promise.all(
    (p.comments || []).map(async (c) => {
      const author = await User
        .findById(c.user_id)
        .select("_id first_name last_name")
        .lean();
      return {
        _id:       c._id,
        comment:   c.comment,
        date_time: c.date_time,
        user:      author,
      };
    })
  );
  return {
    _id:       p._id,
    user_id:   p.user_id,
    file_name: p.file_name,
    caption:   p.caption ?? "",
    date_time: p.date_time,
    comments,
  };
}

publicPhotoRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json(`Photos not found for user id: ${id}`);
  }

  try {
    const photos = await Photo.find({ user_id: id }).lean();
    const result = await Promise.all(photos.map((ph) => formatPhotoForResponse(ph)));
    return res.status(200).json(result);
  } catch (err) {
    console.error("GET /photosOfUser/:id:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

const ALLOWED_EXTS  = [".jpg", ".jpeg", ".png", ".gif"];
const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../images");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTS.includes(ext) && ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error("Only image files (jpg, jpeg, png, gif) are allowed"), false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

mutationsRouter.post("/new", (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json("File too large. Max 10MB");
        }
        return res.status(400).json(`Upload error: ${err.message}`);
      }
      return res.status(400).json(err.message);
    }

    if (!req.file) {
      return res.status(400).json("No file uploaded");
    }

    try {
      const caption =
        typeof req.body.caption === "string" ? req.body.caption.trim() : "";

      const photo = await Photo.create({
        user_id:   req.userId,
        file_name: req.file.filename,
        caption,
        date_time: new Date(),
        comments:  [],
      });

      return res.status(201).json({
        _id:       photo._id,
        user_id:   photo.user_id,
        file_name: photo.file_name,
        caption:   photo.caption,
        date_time: photo.date_time,
        comments:  [],
      });

    } catch (dbErr) {
      if (req.file?.path) {
        fs.unlink(req.file.path, () => {});
      }
      console.error("POST /photos/new:", dbErr);
      return res.status(500).json(`Server error: ${dbErr.message}`);
    }
  });
});

mutationsRouter.patch("/:photoId", async (req, res) => {
  const { photoId } = req.params;
  const { caption } = req.body;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).json("Invalid photo id");
  }
  if (typeof caption !== "string") {
    return res.status(400).json("caption must be a string");
  }

  const trimmed = caption.trim();
  if (trimmed.length > 2000) {
    return res.status(400).json("caption is too long (max 2000 characters)");
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json("Photo not found");
    }
    if (String(photo.user_id) !== String(req.userId)) {
      return res.status(403).json("You can only edit your own photos");
    }

    photo.caption = trimmed;
    await photo.save();

    return res.status(200).json(await formatPhotoForResponse(photo));
  } catch (err) {
    console.error("PATCH /photos/:photoId:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

mutationsRouter.delete("/:photoId", async (req, res) => {
  const { photoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(photoId)) {
    return res.status(400).json("Invalid photo id");
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json("Photo not found");
    }
    if (String(photo.user_id) !== String(req.userId)) {
      return res.status(403).json("You can only delete your own photos");
    }

    const imagePath = path.join(__dirname, "../images", photo.file_name);
    await Photo.deleteOne({ _id: photo._id });

    fs.unlink(imagePath, (unlinkErr) => {
      if (unlinkErr && unlinkErr.code !== "ENOENT") {
        console.error("DELETE photo: could not remove file:", imagePath, unlinkErr.message);
      }
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DELETE /photos/:photoId:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

module.exports = { publicPhotoRouter, mutationsRouter };
