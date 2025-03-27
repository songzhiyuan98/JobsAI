const express = require("express");
const {
  register,
  login,
  googleCallback,
  getMe,
  logout,
} = require("../controllers/auth");
const { protect } = require("../middleware/auth");
// 导入共享的客户端实例
const client = require("../config/googleOAuth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/google", (req, res) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  });
  res.redirect(url);
});
router.get("/google/callback", googleCallback);
router.get("/me", protect, getMe);
router.get("/logout", protect, logout);

module.exports = router;
