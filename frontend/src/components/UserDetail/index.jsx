import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Skeleton,
  Alert,
} from "@mui/material";
import { MapPin, Briefcase, Info, Image } from "lucide-react";
import fetchModel from "../../lib/fetchModelData";
import { COLORS, RADIUS, SHADOWS } from "../../designTokens";

function UserDetail({ setTopBarText }) {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setUser(null);
    setError(null);

    fetchModel(`/user/${userId}`)
      .then((data) => {
        setUser(data);
        setLoading(false);
        if (setTopBarText) {
          setTopBarText(`${data.first_name} ${data.last_name}`);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <Card sx={{ maxWidth: 500, m: 2, transform: "rotate(-1deg)" }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="90%" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, maxWidth: 500 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ color: COLORS.accent }}>
          Không tìm thấy người dùng.
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>
          Không tồn tại người dùng với mã &quot;{userId}&quot;.
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      sx={{
        maxWidth: 500,
        m: 2,
        transform: "rotate(-1deg)",
        transition: "transform 150ms",
        "&:hover": { transform: "rotate(0.5deg)" },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%) rotate(-2deg)",
          width: 64,
          height: 18,
          backgroundColor: "rgba(200,200,200,0.5)",
          borderRadius: 1,
          zIndex: 1,
        },
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            color: COLORS.foreground,
            mb: 0.5,
          }}
        >
          {user.first_name} {user.last_name}
        </Typography>

        <Box
          sx={{
            width: 80,
            height: 3,
            backgroundColor: COLORS.accent,
            borderRadius: 2,
            mb: 2,
            transform: "rotate(-1deg)",
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
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
                flexShrink: 0,
              }}
            >
              <MapPin size={14} strokeWidth={2.5} color={COLORS.foreground} />
            </Box>
            <Typography variant="body1">
              <strong>Địa điểm:</strong>{" "}
              {user.location || (
                <em style={{ color: COLORS.foreground, opacity: 0.4 }}>Chưa có</em>
              )}
            </Typography>
          </Box>

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
                flexShrink: 0,
              }}
            >
              <Briefcase size={14} strokeWidth={2.5} color={COLORS.secondaryAccent} />
            </Box>
            <Typography variant="body1">
              <strong>Nghề nghiệp:</strong>{" "}
              {user.occupation || (
                <em style={{ color: COLORS.foreground, opacity: 0.4 }}>Chưa có</em>
              )}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
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
                backgroundColor: "#fce4ec",
                flexShrink: 0,
                mt: 0.3,
              }}
            >
              <Info size={14} strokeWidth={2.5} color={COLORS.accent} />
            </Box>
            <Typography variant="body1">
              <strong>Giới thiệu:</strong>{" "}
              {user.description || (
                <em style={{ color: COLORS.foreground, opacity: 0.4 }}>Chưa có giới thiệu.</em>
              )}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box
        sx={{
          mx: 2,
          height: 2,
          backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.muted} 0, ${COLORS.muted} 8px, transparent 8px, transparent 16px)`,
          borderRadius: 1,
        }}
      />

      <CardActions sx={{ px: 2, py: 1.5 }}>
        <Button
          component={Link}
          to={`/photos/${user._id}`}
          startIcon={<Image size={16} strokeWidth={2.5} />}
          sx={{
            backgroundColor: COLORS.secondaryAccent,
            color: "#ffffff",
            "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
          }}
        >
          Xem ảnh
        </Button>
      </CardActions>
    </Card>
  );
}

export default UserDetail;
