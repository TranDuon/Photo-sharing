import React, { useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Camera, LogOut, Plus, Image } from "lucide-react";
import { apiClient, extractApiError } from "../../lib/fetchModelData";
import { COLORS, RADIUS, SHADOWS } from "../../designTokens";

function UploadPhotoDialog({ open, onClose, onUploaded }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return URL.createObjectURL(file);
    });
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Hãy chọn ảnh trước.");
      return;
    }
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("caption", caption.trim());
    setUploading(true);
    setError(null);
    apiClient
      .post("/photos/new", formData)
      .then(() => {
        setUploading(false);
        handleClose();
        if (onUploaded) onUploaded();
      })
      .catch((err) => {
        setUploading(false);
        setError(extractApiError(err));
      });
  };

  const handleClose = () => {
    setCaption("");
    setError(null);
    setUploading(false);
    setSelectedFile(null);
    setPreview((prevUrl) => {
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? () => {} : handleClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      disableEscapeKeyDown={uploading}
    >
      <DialogTitle
        sx={{
          fontFamily: '"Times New Roman", Times, serif',
          fontWeight: 700,
          fontSize: "1.4rem",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `2px solid ${COLORS.border}`,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: RADIUS.wobbly,
            border: `2px solid ${COLORS.border}`,
            boxShadow: SHADOWS.card,
            backgroundColor: COLORS.postit,
          }}
        >
          <Camera size={18} strokeWidth={2.5} color={COLORS.foreground} />
        </Box>
        Đăng ảnh mới
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Typography
          variant="body2"
          sx={{ mb: 2, color: COLORS.foreground, opacity: 0.6, fontStyle: "italic" }}
        >
          Bước 1 — chọn ảnh · Bước 2 — xem trước &amp; nhập nội dung · Bước 3 — Đăng hoặc Huỷ
        </Typography>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/jpg"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <Button
              variant="outlined"
              startIcon={<Image size={16} strokeWidth={2.5} />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {selectedFile ? "Đổi ảnh khác" : "Chọn ảnh"}
            </Button>
            {selectedFile && (
              <Typography variant="caption" sx={{ color: COLORS.foreground, opacity: 0.6, alignSelf: "center" }}>
                {selectedFile.name}
              </Typography>
            )}
          </Box>

          {preview && (
            <>
              <Box
                component="img"
                src={preview}
                alt="Xem trước"
                sx={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "contain",
                  backgroundColor: COLORS.muted,
                  borderRadius: RADIUS.wobblyMd,
                  border: `2px solid ${COLORS.border}`,
                  boxShadow: SHADOWS.card,
                  transform: "rotate(-0.5deg)",
                }}
              />
              <TextField
                label="Nội dung bài đăng"
                placeholder="Viết mô tả nội dung cho ảnh…"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                multiline
                minRows={3}
                fullWidth
                disabled={uploading}
                inputProps={{ maxLength: 2000 }}
                helperText={`${caption.length}/2000`}
              />
            </>
          )}

          {!selectedFile && (
            <Typography
              variant="body2"
              sx={{ color: COLORS.foreground, opacity: 0.4, fontStyle: "italic" }}
            >
              Chưa có ảnh. Dùng nút phía trên để chọn file.
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 1, gap: 1 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Huỷ
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <Plus size={16} strokeWidth={2.5} />}
          sx={{
            backgroundColor: COLORS.secondaryAccent,
            color: "#ffffff",
            "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
          }}
        >
          {uploading ? "Đang đăng…" : "Đăng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TopBar({ topBarText, loggedInUser, onLogout, onPhotoUploaded }) {
  const history = useHistory();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loginToContinueOpen, setLoginToContinueOpen] = useState(false);

  const handleAddPhotoClick = () => {
    if (loggedInUser) setUploadOpen(true);
    else setLoginToContinueOpen(true);
  };

  const goToLogin = () => {
    setLoginToContinueOpen(false);
    history.push("/login?openLogin=1");
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          backgroundColor: COLORS.background,
          borderBottom: `3px solid ${COLORS.border}`,
          boxShadow: SHADOWS.standard,
          color: COLORS.foreground,
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", minHeight: 60 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: RADIUS.wobbly,
                border: `2px solid ${COLORS.border}`,
                boxShadow: SHADOWS.card,
                backgroundColor: COLORS.postit,
                transform: "rotate(-3deg)",
                "@keyframes jiggle": {
                  "0%, 100%": { transform: "rotate(-3deg)" },
                  "50%": { transform: "rotate(3deg)" },
                },
                "&:hover": { animation: "jiggle 0.4s ease-in-out" },
              }}
            >
              <Camera size={20} strokeWidth={2.5} color={COLORS.foreground} />
            </Box>
            <Typography
              variant="h5"
              noWrap
              component="div"
              sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, color: COLORS.foreground }}
            >
              Trần Đăng Dương
            </Typography>
          </Box>

          {topBarText && (
            <Typography
              variant="body1"
              noWrap
              sx={{
                fontFamily: '"Times New Roman", Times, serif',
                color: COLORS.foreground,
                opacity: 0.7,
                display: { xs: "none", md: "block" },
                px: 2,
              }}
            >
              {topBarText}
            </Typography>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {loggedInUser ? (
              <>
                <Typography
                  variant="body1"
                  noWrap
                  sx={{
                    fontFamily: '"Times New Roman", Times, serif',
                    color: COLORS.foreground,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  Xin chào <strong>{loggedInUser.first_name}</strong>
                </Typography>

                <Button
                  size="small"
                  startIcon={<Camera size={16} strokeWidth={2.5} />}
                  onClick={handleAddPhotoClick}
                  sx={{
                    backgroundColor: COLORS.postit,
                    "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
                  }}
                >
                  Thêm ảnh
                </Button>

                <Button
                  size="small"
                  startIcon={<LogOut size={16} strokeWidth={2.5} />}
                  onClick={() => {
                    setUploadOpen(false);
                    onLogout();
                    history.push("/login");
                  }}
                  sx={{
                    "&:hover": { backgroundColor: COLORS.foreground, color: "#ffffff" },
                  }}
                >
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="small"
                  startIcon={<Camera size={16} strokeWidth={2.5} />}
                  onClick={handleAddPhotoClick}
                  sx={{
                    backgroundColor: COLORS.postit,
                    "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
                  }}
                >
                  Thêm ảnh
                </Button>
                <Button
                  size="small"
                  onClick={() => history.push("/login?openLogin=1")}
                  sx={{
                    backgroundColor: COLORS.secondaryAccent,
                    color: "#ffffff",
                    "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
                  }}
                >
                  Đăng nhập
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {loggedInUser && (
        <UploadPhotoDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploaded={() => {
            setUploadOpen(false);
            if (onPhotoUploaded) onPhotoUploaded();
          }}
        />
      )}

      <Dialog
        open={loginToContinueOpen}
        onClose={() => setLoginToContinueOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, fontSize: "1.3rem" }}
        >
          Thêm ảnh
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Bạn cần đăng nhập để tiếp tục.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setLoginToContinueOpen(false)}>Đóng</Button>
          <Button
            variant="contained"
            onClick={goToLogin}
            sx={{
              backgroundColor: COLORS.secondaryAccent,
              color: "#ffffff",
              "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
            }}
          >
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TopBar;
