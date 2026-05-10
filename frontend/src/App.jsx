import React, { useState, useCallback } from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { Box, Drawer, Typography, Button } from "@mui/material";

import TopBar from "./components/TopBar";
import UserList from "./components/UserList";
import UserDetail from "./components/UserDetail";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import { setAuthToken } from "./lib/fetchModelData";
import { COLORS, SHADOWS } from "./designTokens";

const DRAWER_WIDTH = 230;

function App() {
  const [topBarText, setTopBarText] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Tăng key này để UserPhotos tự refetch khi có ảnh mới được upload
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);

  const handleContextChange = useCallback((text) => setTopBarText(text), []);

  const handleLoginSuccess = useCallback((user) => {
    // Server có thể trả về { user, token } hoặc trực tiếp user object
    const userObj = user.user ?? user;
    const token = user.token ?? null;

    setLoggedInUser(userObj);
    setTopBarText("");

    if (token) setAuthToken(token);
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedInUser(null);
    setTopBarText("");
    setAuthToken(null);
  }, []);

  const handlePhotoUploaded = useCallback(() => {
    setPhotoRefreshKey((k) => k + 1);
  }, []);

  return (
    <HashRouter>
      <TopBar
        topBarText={topBarText}
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        onPhotoUploaded={handlePhotoUploaded}
      />

      <Box sx={{ display: "flex", mt: "60px" }}>
        {loggedInUser && (
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              "& .MuiDrawer-paper": {
                width: DRAWER_WIDTH,
                boxSizing: "border-box",
                top: "60px",
                height: "calc(100vh - 60px)",
                backgroundColor: COLORS.background,
                borderRight: `3px solid ${COLORS.border}`,
                boxShadow: SHADOWS.card,
              },
            }}
          >
            <UserList
              loggedInUser={loggedInUser}
              onUserSelect={(user) =>
                handleContextChange(`${user.first_name} ${user.last_name}`)
              }
            />
          </Drawer>
        )}

        {/* ── Main content area ── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "calc(100vh - 60px)",
            p: 2,
          }}
        >
          <Switch>
            <Redirect exact from="/" to="/users" />

            {/* Login / Register */}
            <Route
              path="/login"
              render={() =>
                loggedInUser ? (
                  <Redirect to="/users" />
                ) : (
                  <LoginRegister onLoginSuccess={handleLoginSuccess} />
                )
              }
            />

            <Route
              exact
              path="/users"
              render={({ history }) =>
                !loggedInUser ? (
                  <Box sx={{ p: 3, maxWidth: 500 }}>
                    <Typography
                      variant="h5"
                      sx={{ fontFamily: '"Times New Roman", Times, serif', fontWeight: 700, mb: 1.5 }}
                    >
                      Chào mừng bạn!
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, opacity: 0.7 }}>
                      Đăng nhập để xem danh sách người dùng và ảnh.
                    </Typography>
                    <Button
                      onClick={() => history.push("/login?openLogin=1")}
                      sx={{
                        backgroundColor: COLORS.secondaryAccent,
                        color: "#ffffff",
                        "&:hover": { backgroundColor: COLORS.accent, color: "#ffffff" },
                      }}
                    >
                      Đăng nhập ngay
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2, opacity: 0.6, fontStyle: "italic" }}>
                      Chọn người dùng trong danh sách để xem hồ sơ và ảnh.
                    </Typography>
                    <UserList
                      loggedInUser={loggedInUser}
                      onUserSelect={handleContextChange}
                    />
                  </Box>
                )
              }
            />

            <Route
              path="/users/:userId"
              render={({ location }) =>
                !loggedInUser ? (
                  <Redirect
                    to={{ pathname: "/login", search: "?openLogin=1", state: { from: location } }}
                  />
                ) : (
                  <UserDetail setTopBarText={handleContextChange} />
                )
              }
            />

            <Route
              path="/photos/:userId"
              render={({ location }) =>
                !loggedInUser ? (
                  <Redirect
                    to={{ pathname: "/login", search: "?openLogin=1", state: { from: location } }}
                  />
                ) : (
                  <UserPhotos
                    setTopBarText={handleContextChange}
                    loggedInUser={loggedInUser}
                    refreshKey={photoRefreshKey}
                  />
                )
              }
            />

            <Redirect to="/users" />
          </Switch>
        </Box>
      </Box>
    </HashRouter>
  );
}

export default App;
