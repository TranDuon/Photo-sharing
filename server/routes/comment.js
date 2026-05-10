const router   = require("express").Router();
const mongoose = require("mongoose");
const Photo    = require("../db/photoModel");
const User     = require("../db/userModel");

router.post("/:photo_id", async (req, res) => {
  const { photo_id } = req.params;
  const { comment }  = req.body;

  if (!comment || typeof comment !== "string" || !comment.trim()) {
    return res.status(400).json("Comment cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(photo_id)) {
    return res.status(400).json("Invalid photo id");
  }

  try {
    const photo = await Photo.findById(photo_id);

    if (!photo) {
      return res.status(400).json("Photo not found");
    }

    const newComment = {
      comment:   comment.trim(),
      date_time: new Date(),
      user_id:   req.userId,
    };
    photo.comments.push(newComment);
    await photo.save();

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
