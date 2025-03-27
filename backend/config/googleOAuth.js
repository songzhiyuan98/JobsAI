const { OAuth2Client } = require("google-auth-library");

// 创建并导出一个全局的OAuth客户端实例
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.API_URL}/api/auth/google/callback`,
});

module.exports = client;
