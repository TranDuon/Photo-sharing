/**
 * routes/comment.js — Final Project (Problem 2)
 *
 * POST /commentsOfPhoto/:photo_id
 *
 * Auth: yêu cầu JWT (đã qua requireAuth ở index.js → req.userId có sẵn).
 * Body: { comment: "<nội dung>" }
 */
const router   = require("express").Router();
const mongoose = require("mongoose");
const Photo    = require("../db/photoModel");
const User     = require("../db/userModel");

router.post("/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const { comment }  = req.body;

  /* ── [1] Comment không được rỗng ── */
  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return res.status(400).json("Comment cannot be empty");
  }

  /* ── [2] photo_id phải là ObjectId hợp lệ ── */
  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    return res.status(400).json("Invalid photo id");
  }

  try {
    /* ── [3] Tìm photo ── */
    const photo = await Photo.findById(photo_id);

    /* ── [4] Không tồn tại ── */
    if (!photo) {
      return res.status(400).json("Photo not found");
    }

    /* ── [5] + [6] + [7]: Tạo comment object → push → save ── */
    const newComment = {
      comment:   comment.trim(),
      date_time: new Date(),     // thời điểm server nhận request
      user_id:   req.userId,     // gán bởi auth middleware từ JWT
    };
    photo.comments.push(newComment);
    await photo.save();

    /* ── [8] Trả về photo đã update với comments đã populate user ──
       Frontend mong nhận response shape giống GET /photosOfUser/:id:
       mỗi comment có { _id, comment, date_time, user: {_id, first_name, last_name} }
    */
    const populatedComments = await Promise.all(
      photo.comments.map(async (c) => {
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

    return res.status(201).json({
      _id:       photo._id,
      user_id:   photo.user_id,
      file_name: photo.file_name,
      caption:   photo.caption ?? "",
      date_time: photo.date_time,
      comments:  populatedComments,
    });

  } catch (err) {
    console.error("POST /commentsOfPhoto:", err);
    return res.status(500).json(`Server error: ${err.message}`);
  }
});

module.exports = router;
