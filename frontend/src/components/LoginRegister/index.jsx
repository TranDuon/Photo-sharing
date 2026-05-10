import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CloseIcon from "@mui/icons-material/Close";
import { Camera, Lock, UserPlus } from "lucide-react";
import { COLORS, RADIUS, SHADOWS } from "../../designTokens";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

function extractError(err) {
  if (err.response?.data) {
    const d = err.response.data;
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
  }
  if (err.message) return err.message;
  return "Đã xảy ra lỗi không xác định.";
}

/** Nội dung form login */
function LoginForm({ onLoginSuccess }) {
  const history = useHistory();
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = () => {
    if (!loginName.trim() || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    setError(null);
    api
      .post("/admin/login", { login_name: loginName, password })
      .then((res) => {
        setLoading(false);
        const payload = res.data;
        onLoginSuccess(payload);
        const userId = payload.user?._id ?? payload._id;
        if (userId) history.push(`/users/${userId}`);
        else history.push("/users");
      })
      .catch((err) => {
        setLoading(false);
        setError(extractError(err));
      });
  };

  return (
    <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <TextField
        label="Tên đăng nhập"
        value={loginName}
        onChange={(e) => setLoginName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        fullWidth
        autoComplete="username"
      />
      <TextField
        label="Mật khẩu"
        type={showPw ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        fullWidth
        autoComplete="current-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => setShowPw((v) => !v)} edge="end">
                {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={handleLogin}
        disabled={loading}
        startIcon={loading && <CircularProgress size={16} color="inherit" />}
        sx={{
          backgroundColor: COLORS.secondaryAccent,
          color: "#ffffff",
          "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
        }}
      >
        {loading ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </Box>
  );
}

const REGISTER_INITIAL = {
  login_name: "",
  password: "",
  confirm_password: "",
  first_name: "",
  last_name: "",
  location: "",
  description: "",
  occupation: "",
};

/** Phải khai báo ngoài RegisterForm: nếu đặt bên trong, mỗi re-render tạo "loại" component mới → input bị remount và mất focus. */
function RegisterPasswordField({ label, value, onChange, show, setShow, helperText }) {
  return (
    <TextField
      label={label}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      fullWidth
      autoComplete="new-password"
      helperText={helperText}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton size="small" onClick={() => setShow((v) => !v)} edge="end">
              {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

function RegisterForm({ onClose }) {
  const [fields, setFields] = useState(REGISTER_INITIAL);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (name) => (e) => setFields((prev) => ({ ...prev, [name]: e.target.value }));

  const handleRegister = () => {
    setError(null);
    setSuccess(false);
    if (!fields.login_name.trim()) { setError("Vui lòng nhập tên đăng nhập."); return; }
    if (!fields.first_name.trim() || !fields.last_name.trim()) { setError("Vui lòng nhập họ và tên."); return; }
    if (fields.password.length < 6) { setError("Mật khẩu phải có ít nhất 6 ký tự."); return; }
    if (fields.password !== fields.confirm_password) { setError("Xác nhận mật khẩu chưa đúng."); return; }
    setLoading(true);
    const { confirm_password, ...body } = fields; // eslint-disable-line no-unused-vars
    api
      .post("/user", body)
      .then(() => {
        setLoading(false);
        setSuccess(true);
        setFields(REGISTER_INITIAL);
        if (onClose) setTimeout(onClose, 2000);
      })
      .catch((err) => {
        setLoading(false);
        setError(extractError(err));
      });
  };

  return (
    <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
      {success && (
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Đăng ký thành công! Bạn có thể đăng nhập.
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <TextField label="Họ *" value={fields.first_name} onChange={set("first_name")} fullWidth autoComplete="off" />
        <TextField label="Tên *" value={fields.last_name} onChange={set("last_name")} fullWidth autoComplete="off" />
      </Box>
      <TextField
        label="Tên đăng nhập *"
        value={fields.login_name}
        onChange={set("login_name")}
        fullWidth
        autoComplete="username"
        helperText="Phải là duy nhất trong hệ thống"
      />
      <RegisterPasswordField
        label="Mật khẩu *"
        value={fields.password}
        onChange={set("password")}
        show={showPw}
        setShow={setShowPw}
        helperText="Tối thiểu 6 ký tự"
      />
      <RegisterPasswordField
        label="Xác nhận mật khẩu *"
        value={fields.confirm_password}
        onChange={set("confirm_password")}
        show={showConfirm}
        setShow={setShowConfirm}
      />
      <TextField label="Địa điểm" value={fields.location} onChange={set("location")} fullWidth autoComplete="off" />
      <TextField label="Nghề nghiệp" value={fields.occupation} onChange={set("occupation")} fullWidth autoComplete="off" />
      <TextField label="Giới thiệu" value={fields.description} onChange={set("description")} fullWidth multiline rows={2} autoComplete="off" />

      <Button
        variant="contained"
        fullWidth
        onClick={handleRegister}
        disabled={loading}
        startIcon={loading && <CircularProgress size={16} color="inherit" />}
        sx={{
          backgroundColor: COLORS.secondaryAccent,
          color: "#ffffff",
          "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
        }}
      >
        {loading ? "Đang đăng ký…" : "Đăng ký"}
      </Button>
    </Box>
  );
}

function LoginRegister({ onLoginSuccess }) {
  const history = useHistory();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromQuery = params.get("openLogin") === "1";
    const fromState = location.state?.openLoginDialog === true;

    if (!fromQuery && !fromState) return;

    setLoginOpen(true);

    params.delete("openLogin");
    const search = params.toString() ? `?${params.toString()}` : "";
    history.replace({ pathname: "/login", search, state: {} });
  }, [location.pathname, location.search, location.state, history]);

  const handleLoginSuccess = (payload) => {
    setLoginOpen(false);
    onLoginSuccess(payload);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, sm: 4 },
        py: 6,
      }}
    >
      {/* Main landing card */}
      <Box
        sx={{
          maxWidth: 560,
          width: "100%",
          backgroundColor: "#ffffff",
          borderRadius: RADIUS.wobblyMd,
          border: `3px solid ${COLORS.border}`,
          boxShadow: SHADOWS.emphasized,
          px: { xs: 3, sm: 5 },
          py: 5,
          textAlign: "center",
          position: "relative",
          transform: "rotate(-0.5deg)",
          /* Tape decoration */
          "&::before": {
            content: '""',
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            width: 80,
            height: 22,
            backgroundColor: "rgba(200,200,200,0.55)",
            borderRadius: 2,
          },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: RADIUS.wobbly,
            border: `3px solid ${COLORS.border}`,
            boxShadow: SHADOWS.standard,
            backgroundColor: COLORS.postit,
            mb: 2.5,
            transform: "rotate(3deg)",
            "@keyframes bounce": {
              "0%, 100%": { transform: "rotate(3deg) translateY(0)" },
              "50%": { transform: "rotate(3deg) translateY(-8px)" },
            },
            animation: "bounce 3s ease-in-out infinite",
          }}
        >
          <Camera size={36} strokeWidth={2.5} color={COLORS.foreground} />
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            color: COLORS.foreground,
            mb: 0.5,
          }}
        >
          Chia sẻ ảnh
        </Typography>

        {/* Decorative underline */}
        <Box
          sx={{
            width: 100,
            height: 4,
            backgroundColor: COLORS.accent,
            borderRadius: 2,
            mx: "auto",
            mb: 2.5,
            transform: "rotate(-1deg)",
          }}
        />

        <Typography
          variant="body1"
          sx={{
            color: COLORS.foreground,
            opacity: 0.7,
            mb: 4,
            lineHeight: 1.8,
          }}
        >
          Chia sẻ khoảnh khắc — xem ảnh của bạn bè, bình luận và tải ảnh mới lên.
        </Typography>

        {/* CTA buttons */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Button
            size="large"
            startIcon={<Lock size={18} strokeWidth={2.5} />}
            onClick={() => setLoginOpen(true)}
            sx={{
              px: 3,
              "&:hover": { backgroundColor: COLORS.secondaryAccent, color: "#ffffff" },
            }}
          >
            Đăng nhập
          </Button>
          <Button
            size="large"
            startIcon={<UserPlus size={18} strokeWidth={2.5} />}
            onClick={() => setRegisterOpen(true)}
            sx={{
              px: 3,
              backgroundColor: COLORS.accent,
              color: "#ffffff",
              "&:hover": { backgroundColor: "#e03030", color: "#ffffff" },
            }}
          >
            Đăng ký
          </Button>
        </Box>

        {/* Decorative corner doodle */}
        <Typography
          sx={{
            position: "absolute",
            bottom: 12,
            right: 16,
            fontSize: "1.4rem",
            opacity: 0.18,
            transform: "rotate(10deg)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✏️
        </Typography>
      </Box>

      {/* Dialog đăng nhập */}
      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle
          sx={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            fontSize: "1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
            borderBottom: `2px solid ${COLORS.muted}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: RADIUS.wobbly,
                border: `2px solid ${COLORS.border}`,
                boxShadow: SHADOWS.card,
                backgroundColor: COLORS.postit,
              }}
            >
              <Lock size={15} strokeWidth={2.5} color={COLORS.foreground} />
            </Box>
            Đăng nhập
          </Box>
          <IconButton aria-label="Đóng" onClick={() => setLoginOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </DialogContent>
      </Dialog>

      {/* Dialog đăng ký */}
      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} maxWidth="sm" fullWidth scroll="paper">
        <DialogTitle
          sx={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            fontSize: "1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 1,
            borderBottom: `2px solid ${COLORS.muted}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: RADIUS.wobbly,
                border: `2px solid ${COLORS.border}`,
                boxShadow: SHADOWS.card,
                backgroundColor: "#e8f0fe",
              }}
            >
              <UserPlus size={15} strokeWidth={2.5} color={COLORS.secondaryAccent} />
            </Box>
            Đăng ký tài khoản
          </Box>
          <IconButton aria-label="Đóng" onClick={() => setRegisterOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <RegisterForm onClose={() => setRegisterOpen(false)} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default LoginRegister;
