import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Box,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { MessageCircle, Send, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import fetchModel, { apiClient, extractApiError } from "../../lib/fetchModelData";
import { COLORS, RADIUS, SHADOWS } from "../../designTokens";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function photoImageSrc(fileName) {
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  return `${base}/images/${fileName}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPhotoOwner(photo, user) {
  if (!user?._id) return false;
  return String(photo.user_id) === String(user._id);
}

/* ─────────────────────────────────────────────
   CommentItem
───────────────────────────────────────────── */
function CommentItem({ comment }) {
  const { user } = comment;
  if (!user || !user.first_name) {
    return (
      <Typography variant="caption" sx={{ display: "block", py: 1, opacity: 0.5 }}>
        (Thiếu thông tin tác giả bình luận)
      </Typography>
    );
  }
  const initials = `${user.first_name[0]}${(user.last_name || "?")[0]}`.toUpperCase();

  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
      <Avatar
        component={Link}
        to={`/users/${user._id}`}
        sx={{
          width: 34,
          height: 34,
          fontSize: "0.8rem",
          fontFamily: '"Times New Roman", Times, serif',
          fontWeight: 700,
          bgcolor: COLORS.secondaryAccent,
          border: `2px solid ${COLORS.border}`,
          boxShadow: SHADOWS.card,
          textDecoration: "none",
          flexShrink: 0,
          mt: 0.5,
        }}
      >
        {initials}
      </Avatar>

      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: RADIUS.wobblyMd,
          border: `2px solid ${COLORS.muted}`,
          boxShadow: SHADOWS.card,
          backgroundColor: "#fafaf7",
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
          <Typography
            component={Link}
            to={`/users/${user._id}`}
            variant="body2"
            sx={{
              fontFamily: '"Times New Roman", Times, serif',
              fontWeight: 700,
              color: COLORS.secondaryAccent,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" sx={{ color: COLORS.foreground, opacity: 0.45 }}>
            {formatDate(comment.date_time)}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ mt: 0.5, fontFamily: '"Times New Roman", Times, serif' }}>
          {comment.comment}
        </Typography>
      </Box>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   AddCommentForm
───────────────────────────────────────────── */
function AddCommentForm({ photoId, loggedInUser, onAdded }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const handlePost = () => {
    if (!text.trim()) { setError("Nội dung bình luận không được để trống."); return; }
    setPosting(true);
    setError(null);
    apiClient
      .post(`/commentsOfPhoto/${photoId}`, { comment: text.trim() })
      .then((res) => {
        setPosting(false);
        setText("");
        const data = res.data;
        let newComment = null;
        if (data && Array.isArray(data.comments) && data.comments.length > 0) {
          newComment = data.comments[data.comments.length - 1];
        }
        if (!newComment?.user && loggedInUser) {
          newComment = {
            _id: newComment?._id ?? `temp-${Date.now()}`,
            comment: newComment?.comment ?? text.trim(),
            date_time: newComment?.date_time ?? new Date().toISOString(),
            user: {
              _id: loggedInUser._id,
              first_name: loggedInUser.first_name,
              last_name: loggedInUser.last_name ?? "",
            },
          };
        }
        if (!newComment) { setError("Phản hồi từ máy chủ không hợp lệ."); return; }
        onAdded(newComment);
      })
      .catch((err) => {
        setPosting(false);
        setError(extractApiError(err));
      });
  };

  return (
    <Box sx={{ mt: 1.5 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <TextField
          placeholder="Viết bình luận…"
          value={text}
          onChange={(e) => { setText(e.target.value); if (error) setError(null); }}
          onKeyDown={(e) => { if (e.key === "Enter" && e.ctrlKey) handlePost(); }}
          multiline
          maxRows={4}
          size="small"
          fullWidth
          disabled={posting}
        />
        <Button
          size="small"
          onClick={handlePost}
          disabled={posting || !text.trim()}
          endIcon={posting ? <CircularProgress size={14} color="inherit" /> : <Send size={14} strokeWidth={2.5} />}
          sx={{
            whiteSpace: "nowrap",
            alignSelf: "flex-end",
            mb: 0.5,
            backgroundColor: COLORS.secondaryAccent,
            color: "#ffffff",
            "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
          }}
        >
          {posting ? "Đang gửi…" : "Gửi"}
        </Button>
      </Box>
      <Typography variant="caption" sx={{ mt: 0.5, display: "block", opacity: 0.4 }}>
        Ctrl+Enter để gửi
      </Typography>
    </Box>
  );
}

/* ─────────────────────────────────────────────
   PhotoCard
───────────────────────────────────────────── */
function PhotoCard({ photo, loggedInUser, onPhotoUpdated, onPhotoDeleted, tiltDeg }) {
  const [localComments, setLocalComments] = useState(photo.comments ?? []);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(photo.caption ?? "");
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const owner = isPhotoOwner(photo, loggedInUser);

  useEffect(() => { setLocalComments(photo.comments ?? []); }, [photo]);
  useEffect(() => { if (!editing) setEditDraft(photo.caption ?? ""); }, [photo.caption, photo._id, editing]);

  const handleCommentAdded = (newComment) => setLocalComments((prev) => [...prev, newComment]);

  const handleSaveCaption = () => {
    if (editDraft.length > 2000) { setActionError("Nội dung tối đa 2000 ký tự."); return; }
    setSaving(true);
    setActionError(null);
    apiClient
      .patch(`/photos/${photo._id}`, { caption: editDraft })
      .then((res) => { setSaving(false); setEditing(false); if (onPhotoUpdated) onPhotoUpdated(res.data); })
      .catch((err) => { setSaving(false); setActionError(extractApiError(err)); });
  };

  const handleDelete = () => {
    setDeleting(true);
    setActionError(null);
    apiClient
      .delete(`/photos/${photo._id}`)
      .then(() => { setDeleting(false); setDeleteOpen(false); if (onPhotoDeleted) onPhotoDeleted(photo._id); })
      .catch((err) => { setDeleting(false); setActionError(extractApiError(err)); });
  };

  return (
    <Card
      sx={{
        transform: `rotate(${tiltDeg}deg)`,
        transition: "transform 150ms, box-shadow 150ms",
        "&:hover": { transform: "rotate(0deg)", boxShadow: SHADOWS.emphasized },
        position: "relative",
        overflow: "visible",
        /* Tape decoration */
        "&::before": {
          content: '""',
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%) rotate(-1.5deg)",
          width: 72,
          height: 20,
          backgroundColor: "rgba(200,200,200,0.5)",
          borderRadius: 2,
          zIndex: 1,
        },
      }}
    >
      {/* Photo image */}
      <CardMedia
        component="img"
        image={photoImageSrc(photo.file_name)}
        alt={photo.file_name}
        sx={{
          maxHeight: 480,
          objectFit: "contain",
          backgroundColor: "#1a1a1a",
          width: "100%",
          borderBottom: `2px solid ${COLORS.border}`,
        }}
        onError={(e) => {
          e.target.src = "https://placehold.co/800x480/1a1a1a/555?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh";
        }}
      />

      <CardContent>
        {actionError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {/* Date + owner actions row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            {formatDate(photo.date_time)}
          </Typography>
          {owner && !editing && (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                aria-label="Sửa bài đăng"
                onClick={() => { setEditing(true); setEditDraft(photo.caption ?? ""); setActionError(null); }}
                sx={{
                  border: `1.5px solid ${COLORS.muted}`,
                  borderRadius: RADIUS.wobbly,
                  "&:hover": { backgroundColor: COLORS.postit, borderColor: COLORS.border },
                }}
              >
                <Edit2 size={14} strokeWidth={2.5} color={COLORS.foreground} />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Xóa bài đăng"
                onClick={() => { setDeleteOpen(true); setActionError(null); }}
                sx={{
                  border: `1.5px solid ${COLORS.muted}`,
                  borderRadius: RADIUS.wobbly,
                  "&:hover": { backgroundColor: "#fce4ec", borderColor: COLORS.accent },
                }}
              >
                <Trash2 size={14} strokeWidth={2.5} color={COLORS.accent} />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Caption / edit */}
        {editing ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              label="Nội dung bài đăng"
              value={editDraft}
              onChange={(e) => setEditDraft(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              size="small"
              disabled={saving}
              inputProps={{ maxLength: 2000 }}
              helperText={`${editDraft.length}/2000`}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                size="small"
                disabled={saving}
                onClick={() => { setEditing(false); setEditDraft(photo.caption ?? ""); }}
              >
                Huỷ
              </Button>
              <Button
                size="small"
                onClick={handleSaveCaption}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : null}
                sx={{
                  backgroundColor: COLORS.secondaryAccent,
                  color: "#ffffff",
                  "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
                }}
              >
                {saving ? "Đang lưu…" : "Lưu"}
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            {photo.caption ? (
              <Typography variant="body1" sx={{ mt: 0.5, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {photo.caption}
              </Typography>
            ) : owner ? (
              <Typography
                variant="body2"
                sx={{ mt: 0.5, fontStyle: "italic", color: COLORS.foreground, opacity: 0.4 }}
              >
                Chưa có nội dung.
              </Typography>
            ) : null}
          </>
        )}

        {/* Dashed divider */}
        <Box
          sx={{
            my: 2,
            height: 0,
            borderTop: `2px dashed ${COLORS.muted}`,
          }}
        />

        {/* Comments header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: RADIUS.wobbly,
              border: `2px solid ${COLORS.border}`,
              boxShadow: SHADOWS.card,
              backgroundColor: COLORS.postit,
            }}
          >
            <MessageCircle size={14} strokeWidth={2.5} color={COLORS.foreground} />
          </Box>
          <Typography
            variant="body2"
            sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, color: COLORS.foreground }}
          >
            {localComments.length > 0
              ? `${localComments.length} bình luận`
              : "Chưa có bình luận"}
          </Typography>
        </Box>

        {localComments.length > 0 ? (
          <Box sx={{ mb: 1 }}>
            {localComments.map((comment) => (
              <CommentItem key={comment._id} comment={comment} />
            ))}
          </Box>
        ) : (
          <Typography
            variant="body2"
            sx={{ fontStyle: "italic", mb: 1, color: COLORS.foreground, opacity: 0.4 }}
          >
            Hãy là người bình luận đầu tiên.
          </Typography>
        )}

        {loggedInUser && (
          <>
            <Box sx={{ my: 1.5, height: 0, borderTop: `2px dashed ${COLORS.muted}` }} />
            <AddCommentForm
              photoId={photo._id}
              loggedInUser={loggedInUser}
              onAdded={handleCommentAdded}
            />
          </>
        )}
      </CardContent>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: "1.3rem" }}
        >
          Xóa bài đăng?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Ảnh, nội dung và toàn bộ bình luận sẽ bị xóa vĩnh viễn. Thao tác này không hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>Huỷ</Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              backgroundColor: COLORS.accent,
              color: "#ffffff",
              "&:hover": { backgroundColor: "#c0392b", color: "#ffffff" },
            }}
          >
            {deleting ? "Đang xóa…" : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   PhotoSkeleton
───────────────────────────────────────────── */
function PhotoSkeleton() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={300} />
      <CardContent>
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" width="50%" sx={{ mt: 1 }} />
        <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
          <Skeleton variant="circular" width={34} height={34} />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="80%" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   UserPhotos — main component
───────────────────────────────────────────── */

/**
 * UserPhotos
 *
 * Props:
 *   setTopBarText   {function}    - cập nhật TopBar context
 *   loggedInUser    {object|null} - user đang đăng nhập
 *   refreshKey      {number}      - tăng giá trị để trigger refetch ảnh
 */
function UserPhotos({ setTopBarText, loggedInUser, refreshKey }) {
  const { userId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handlePhotoUpdated = (updated) =>
    setPhotos((prev) => prev.map((p) => (String(p._id) === String(updated._id) ? updated : p)));

  const handlePhotoDeleted = (photoId) =>
    setPhotos((prev) => prev.filter((p) => String(p._id) !== String(photoId)));

  useEffect(() => {
    setLoading(true);
    setPhotos([]);
    setUserName("");
    setError(null);

    Promise.all([
      fetchModel(`/user/${userId}`),
      fetchModel(`/photosOfUser/${userId}`),
    ])
      .then(([user, userPhotos]) => {
        const name = `${user.first_name} ${user.last_name}`;
        setUserName(name);
        setPhotos(userPhotos);
        setLoading(false);
        if (setTopBarText) setTopBarText(`Ảnh của ${name}`);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <Box sx={{ p: 2, maxWidth: 700, mx: "auto" }}>
        <Skeleton variant="text" width="40%" height={50} sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <PhotoSkeleton />
          <PhotoSkeleton />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, maxWidth: 700, mx: "auto" }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!userName) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: COLORS.accent }}>
          Không tìm thấy người dùng.
        </Typography>
      </Box>
    );
  }

  if (photos.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: RADIUS.wobbly,
            border: `3px solid ${COLORS.muted}`,
            boxShadow: SHADOWS.card,
            backgroundColor: "#ffffff",
            transform: "rotate(-5deg)",
          }}
        >
          <ImageIcon size={36} strokeWidth={1.5} color={COLORS.muted} />
        </Box>
        <Typography variant="h5" sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, opacity: 0.5 }}>
          Chưa có ảnh
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.5 }}>
          {userName} chưa đăng ảnh nào.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: 700, mx: "auto" }}>
      {/* Heading */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <Typography
          variant="h4"
          sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, color: COLORS.foreground }}
        >
          Ảnh của {userName}
        </Typography>
        <Chip
          label={photos.length}
          size="small"
          sx={{
            fontFamily: '"Times New Roman", Times, serif',
            backgroundColor: COLORS.accent,
            color: "#ffffff",
            border: `2px solid ${COLORS.border}`,
            boxShadow: SHADOWS.card,
          }}
        />
      </Box>

      {/* Photo list */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {photos.map((photo, idx) => {
          // Alternate slight tilts for playful layout
          const tilt = idx % 3 === 0 ? -1 : idx % 3 === 1 ? 0.8 : -0.5;
          return (
            <PhotoCard
              key={photo._id}
              photo={photo}
              loggedInUser={loggedInUser}
              onPhotoUpdated={handlePhotoUpdated}
              onPhotoDeleted={handlePhotoDeleted}
              tiltDeg={tilt}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default UserPhotos;
