const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 保护路由
exports.protect = async (req, res, next) => {
  let token;

  // 检查请求头中的授权令牌
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 确保令牌存在
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "无权访问此路由",
    });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 将用户添加到请求对象
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "用户不存在",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "无权访问此路由",
    });
  }
};
