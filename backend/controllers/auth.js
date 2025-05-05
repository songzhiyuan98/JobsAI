const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const googleOAuthClient = require("../config/googleOAuth");

// @desc    注册用户
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 检查邮箱是否已经被注册
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "该邮箱已被注册",
      });
    }

    // 创建用户
    user = await User.create({
      name,
      email,
      password,
      authProviders: [
        {
          provider: "local",
          providerId: email,
        },
      ],
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "服务器错误，请稍后再试",
    });
  }
};

// @desc    登录用户
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 验证邮箱和密码是否提供
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "请提供邮箱和密码",
      });
    }

    // 查找用户
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "无效的凭据",
      });
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "无效的凭据",
      });
    }

    // 更新最后登录时间
    const localProvider = user.authProviders.find(
      (p) => p.provider === "local"
    );
    if (localProvider) {
      localProvider.lastLogin = Date.now();
      await user.save();
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "服务器错误，请稍后再试",
    });
  }
};

// @desc    谷歌OAuth回调
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res, next) => {
  const { code } = req.query;

  try {
    const tokenData = await googleOAuthClient.getToken(code);
    const { tokens } = tokenData;
    const idToken = tokens.id_token;
    const accessToken = tokens.access_token;

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // 检查用户是否已存在
    let user = await User.findOne({
      "authProviders.provider": "google",
      "authProviders.providerId": googleId,
    });

    if (!user) {
      // 检查是否有使用此邮箱的本地账户
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // 将Google身份添加到现有账户
        existingUser.authProviders.push({
          provider: "google",
          providerId: googleId,
          accessToken: accessToken,
        });
        user = await existingUser.save();
      } else {
        // 创建新用户
        user = await User.create({
          name,
          email,
          authProviders: [
            {
              provider: "google",
              providerId: googleId,
              accessToken: accessToken,
            },
          ],
        });
      }
    } else {
      // 更新最后登录时间和accessToken
      const googleProvider = user.authProviders.find(
        (p) => p.provider === "google"
      );
      googleProvider.lastLogin = Date.now();
      googleProvider.accessToken = accessToken;
      await user.save();
    }

    // 创建前端可用的JWT
    const token = user.getSignedJwtToken();

    // 重定向到前端应用，带上令牌
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// @desc    获取当前登录用户
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // 使用 select 确保包含 accessToken 字段
    const user = await User.findById(req.user.id).select(
      "+authProviders.accessToken"
    );

    // 如果是 Google 登录用户，获取 Google 用户信息
    if (user.authProviders.some((p) => p.provider === "google")) {
      const googleProvider = user.authProviders.find(
        (p) => p.provider === "google"
      );

      try {
        // 使用 Google 公开 API 获取用户信息
        const response = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo?alt=json&access_token=${googleProvider.accessToken}`
        );
        const data = await response.json();

        // 更新用户的 googleProfile
        user.googleProfile = {
          picture: data.picture,
          given_name: data.given_name,
          family_name: data.family_name,
        };

        // 保存更新后的用户信息
        await user.save();
      } catch (err) {
        // 静默处理错误
      }
    }

    // 重新查询用户以确保返回最新数据
    const updatedUser = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "服务器错误，请稍后再试",
    });
  }
};

// @desc    退出登录
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "退出登录成功",
  });
};

// 生成令牌响应
const sendTokenResponse = (user, statusCode, res) => {
  // 创建令牌
  const token = user.getSignedJwtToken();

  // 移除密码
  user = user.toObject();
  delete user.password;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};
