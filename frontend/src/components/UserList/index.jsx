import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { User } from "lucide-react";
import fetchModel from "../../lib/fetchModelData";
import { COLORS, RADIUS, SHADOWS } from "../../designTokens";

/** Đưa tài khoản đang đăng nhập lên đầu; còn lại sắp theo họ tên. */
function sortUsersWithSelfFirst(users, selfId) {
  if (!selfId) return users;
  const id = String(selfId);
  return [...users].sort((a, b) => {
    const aSelf = String(a._id) === id;
    const bSelf = String(b._id) === id;
    if (aSelf !== bSelf) return aSelf ? -1 : 1;
    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}

/**
 * UserList
 *
 * Props:
 *   loggedInUser {object|null} - nếu có: ưu tiên hiển thị bản thân đầu danh sách
 *   onUserSelect {function}    - optional callback(user) khi click vào một user
 */
function UserList({ loggedInUser, onUserSelect }) {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (!loggedInUser) {
      setUserList([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetchModel("/user/list")
      .then((data) => {
        setUserList(sortUsersWithSelfFirst(data, loggedInUser._id));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [loggedInUser]);

  if (!loggedInUser) {
    return (
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="body2"
          sx={{ color: COLORS.foreground, opacity: 0.5, fontStyle: "italic" }}
        >
          Đăng nhập để xem danh sách người dùng.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
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
          <User size={14} strokeWidth={2.5} color={COLORS.foreground} />
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontFamily: '"Times New Roman", Times, serif',
            fontWeight: 700,
            fontSize: "0.85rem",
            color: COLORS.foreground,
            opacity: 0.7,
            letterSpacing: 0.5,
          }}
        >
          Người dùng
        </Typography>
      </Box>

      {/* Decorative divider */}
      <Box
        sx={{
          mx: 2,
          mb: 1,
          height: 2,
          backgroundColor: COLORS.muted,
          borderRadius: 1,
        }}
      />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} sx={{ color: COLORS.secondaryAccent }} />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ m: 1, fontSize: "0.75rem" }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <List sx={{ p: 1 }}>
          {userList.map((user, idx) => {
            const path = `/users/${user._id}`;
            const isActive = location.pathname === path;
            const isSelf = loggedInUser && String(user._id) === String(loggedInUser._id);
            // Slight alternating rotation for playful feel
            const rot = idx % 2 === 0 ? "-0.5deg" : "0.5deg";

            return (
              <ListItem key={user._id} disablePadding sx={{ mb: 0.75 }}>
                <ListItemButton
                  component={Link}
                  to={path}
                  onClick={() => onUserSelect && onUserSelect(user)}
                  sx={{
                    borderRadius: RADIUS.wobblyMd,
                    border: `2px solid ${isActive ? COLORS.secondaryAccent : COLORS.border}`,
                    boxShadow: isActive ? SHADOWS.standard : SHADOWS.card,
                    backgroundColor: isActive
                      ? COLORS.secondaryAccent
                      : isSelf
                      ? COLORS.postit
                      : "#ffffff",
                    color: isActive ? "#ffffff" : COLORS.foreground,
                    transform: `rotate(${rot})`,
                    transition: "transform 100ms, box-shadow 100ms, background-color 100ms",
                    "&:hover": {
                      backgroundColor: isActive ? COLORS.secondaryAccent : COLORS.postit,
                      transform: `rotate(${idx % 2 === 0 ? "0.5deg" : "-0.5deg"})`,
                      boxShadow: SHADOWS.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      isSelf
                        ? `${user.first_name} ${user.last_name} (bạn)`
                        : `${user.first_name} ${user.last_name}`
                    }
                    primaryTypographyProps={{
                      fontFamily: '"Times New Roman", Times, serif',
                      fontSize: "0.9rem",
                      fontWeight: isSelf ? 700 : 400,
                      color: isActive ? "#ffffff" : COLORS.foreground,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
}

export default UserList;
