# 🚀 TalentSync

> AI驱动的智能求职助手 - 简历分析、职位匹配、求职信生成、面试模拟

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://talentsync-green.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)](https://www.mongodb.com/)

## 📖 项目简介

TalentSync 是一个全栈 Web 应用，帮助求职者通过 AI 技术提升求职成功率。平台提供简历与职位匹配度分析、智能求职信生成、AI 面试模拟等核心功能，支持多种 AI 模型（GPT-4o、GPT-o1、Google Gemini），帮助用户优化简历、精准投递、提升面试表现。

### 🌐 在线演示

**🔗 [访问 Demo](https://talentsync-green.vercel.app)**

> 当前为测试运营版本，所有功能免费开放体验

---

## ✨ 核心功能

### 📊 简历与职位匹配分析
- **ATS 分析**：关键词匹配、格式检查、通过概率评估
- **排名分析**：预测排名百分位、与 Top 候选人对比
- **HR 分析**：第一印象评估、面试推荐、表达问题识别
- **技术分析**：可信度评估、潜在风险识别、预期面试问题

### ✍️ 智能求职信生成
- 基于简历和目标职位自动生成个性化求职信
- 突出相关经验和技能匹配
- 支持多语言和多种风格
- 一键导出 PDF

### 💼 职位管理
- 职位描述智能解析（JD Parsing）
- 职位信息结构化存储
- 职位状态跟踪（已保存、已投递、面试中、已录用、已拒绝）

### 🤖 AI 面试模拟
- 10 轮面试模拟（2 轮行为面试 + 8 轮技术面试）
- 基于简历和 JD 的上下文问题生成
- 2-3 层跟进深度
- 综合评分和改进建议

### 🔐 用户系统
- 邮箱注册/登录
- Google OAuth 2.0 登录
- JWT 认证
- 订阅管理（Free、Premium、Enterprise）

---

## 🛠️ 技术栈

### Frontend
- **框架**: React 18.2.0
- **路由**: react-router-dom v6.30.0
- **状态管理**: Redux Toolkit v2.6.1
- **样式**: Tailwind CSS + Material-UI v7.0.0
- **动画**: Framer Motion v12.12.1
- **PDF 处理**: jspdf + html2pdf.js
- **图表**: ECharts v5.6.0

### Backend
- **运行时**: Node.js
- **框架**: Express.js v4.21.2
- **数据库**: MongoDB + Mongoose v8.13.0
- **认证**: JWT + Google OAuth 2.0 + bcryptjs
- **AI 服务**: OpenAI (GPT-4o, GPT-o1) + Google Gemini
- **支付**: Stripe v18.1.0
- **文件处理**: multer + pdf-parse + pdfkit

### 部署
- **前端**: Vercel
- **后端**: Railway
- **数据库**: MongoDB Atlas

---

## 📁 项目结构

```
TalentSync/
├── backend/                        # 后端服务
│   ├── app.js                      # Express 应用入口
│   ├── setup.js                    # 初始化设置
│   ├── models/                     # Mongoose 数据模型
│   │   ├── User.js                 # 用户模型
│   │   ├── Subscription.js         # 会员订阅模型
│   │   ├── Resume.js               # 简历模型
│   │   ├── Analysis.js             # 智能分析模型
│   │   ├── CoverLetter.js          # 求职信模型
│   │   ├── Interview.js            # 面试相关模型
│   │   └── UserJob.js              # 用户职位关联
│   ├── controllers/                # 业务控制器
│   │   ├── auth.js                 # 用户认证
│   │   ├── paymentController.js    # Stripe 支付与订阅
│   │   ├── resumeController.js     # 简历相关
│   │   ├── jobController.js        # 职位相关
│   │   ├── analysisController.js   # 智能分析
│   │   ├── coverLetterController.js # 求职信
│   │   └── interviewController.js  # 面试相关
│   ├── routes/                     # 路由定义
│   ├── middleware/                 # 中间件
│   │   ├── auth.js                 # 登录校验中间件
│   │   ├── checkSubscription.js    # 订阅状态检查中间件
│   │   └── uploadMiddleware.js     # 文件上传中间件
│   ├── services/                   # 业务服务
│   │   ├── resumeAnalysisService.js # 简历分析服务
│   │   ├── aiPrompts.js            # AI 提示词管理
│   │   ├── aiService.js            # AI 服务集成
│   │   ├── jobParser.js            # 职位解析服务
│   │   └── resumeParser.js         # 简历解析服务
│   └── config/                     # 配置文件
│       └── googleOAuth.js          # Google OAuth 配置
├── frontend/                       # 前端项目
│   ├── src/
│   │   ├── pages/                  # 页面级组件
│   │   │   ├── Dashboard.js        # 仪表盘主面板
│   │   │   ├── PersonalCenter.js   # 个人中心
│   │   │   ├── JobManagerPage.js   # 职位管理
│   │   │   ├── AnalysisStartPage.js # 智能分析入口
│   │   │   └── ...
│   │   ├── components/             # 复用型组件
│   │   │   ├── dashboard/          # 仪表盘相关组件
│   │   │   ├── job/                # 职位相关组件
│   │   │   ├── resume/             # 简历相关组件
│   │   │   └── analysis/           # 智能分析相关组件
│   │   ├── store/                  # Redux 状态管理
│   │   │   ├── userSlice.js        # 用户/会员状态
│   │   │   ├── authSlice.js        # 登录状态
│   │   │   └── userActions.js      # 用户相关异步 action
│   │   └── services/               # API 封装
│   └── public/                     # 静态资源
└── README.md                       # 项目说明
```

---

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- MongoDB (本地或 MongoDB Atlas)
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/talentsync.git
cd talentsync
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **安装前端依赖**
```bash
cd ../frontend
npm install
```

4. **配置环境变量**

创建 `backend/.env` 文件：
```env
MONGO_URI=mongodb://localhost:27017/talentsync
OPENAI_API_KEY=sk-proj-...
GEMINI_API_KEY=...
JWT_SECRET=your_jwt_secret
PORT=3001
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

创建 `frontend/.env` 文件：
```env
REACT_APP_API_URL=http://localhost:3001
```

5. **启动开发服务器**

启动后端（端口 3001）：
```bash
cd backend
npm start
```

启动前端（端口 3000）：
```bash
cd frontend
npm start
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

---

## 📡 API 文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/google` - Google OAuth 登录
- `GET /api/auth/me` - 获取当前用户信息
- `GET /api/auth/logout` - 退出登录

### 简历管理
- `POST /api/resumes/upload` - 上传简历
- `GET /api/resumes` - 获取所有简历
- `GET /api/resumes/active` - 获取激活简历
- `PUT /api/resumes/:id/set-active` - 设置激活简历
- `DELETE /api/resumes/:id` - 删除简历

### 职位管理
- `POST /api/jobs/parse` - 解析职位描述
- `POST /api/jobs` - 保存职位
- `GET /api/jobs/user` - 获取用户所有职位
- `GET /api/jobs/:id` - 获取职位详情

### 智能分析
- `POST /api/analysis` - 创建分析
- `GET /api/analysis/:id` - 获取分析详情
- `GET /api/analysis` - 获取用户所有分析

### 求职信
- `POST /api/cover-letters` - 生成求职信
- `GET /api/cover-letters/:id` - 获取求职信
- `GET /api/cover-letters/:id/download` - 下载 PDF

### 支付与订阅
- `POST /api/payment/create-checkout-session` - 创建支付会话
- `GET /api/payment/get-subscription-status` - 获取订阅状态
- `POST /api/payment/cancel-subscription` - 取消订阅

更多 API 详情请参考 [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

## 🎯 订阅计划

| 功能 | Free | Premium | Enterprise |
|------|------|---------|------------|
| Gemini 模型 | ✅ 无限 | ✅ 无限 | ✅ 无限 |
| GPT-4o 分析 | 1次/天 | ✅ 无限 | ✅ 无限 |
| GPT-o1 分析 | ❌ | ❌ | ✅ 无限 |
| 求职信生成 | ✅ | ✅ | ✅ |
| 面试模拟 | ✅ | ✅ | ✅ |

---

## 🔒 安全特性

- JWT Token 认证
- 密码 bcrypt 加密
- Google OAuth 2.0 安全登录
- Stripe 安全支付集成
- 文件上传大小限制（10MB）
- CORS 配置
- Helmet 安全头设置

---

## 📝 开发规范

- **前端**: React 函数式组件，禁止 class 组件
- **状态管理**: Redux Toolkit，统一 action 命名规范
- **API 请求**: 统一使用 axios，所有 API 路径以 `/api/` 开头
- **代码风格**: ES6+ 语法，统一使用 async/await
- **命名规范**: camelCase（变量/函数），PascalCase（组件文件）

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 📧 联系方式

- **邮箱**: songzhiyuan98@gmail.com
- **项目链接**: [https://github.com/your-username/talentsync](https://github.com/your-username/talentsync)
- **在线演示**: [https://talentsync-green.vercel.app](https://talentsync-green.vercel.app)

---

## 🙏 致谢

- [OpenAI](https://openai.com/) - GPT-4o, GPT-o1 API
- [Google Gemini](https://gemini.google.com/) - Gemini API
- [Stripe](https://stripe.com/) - 支付服务
- [Vercel](https://vercel.com/) - 前端部署
- [Railway](https://railway.app/) - 后端部署

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star！⭐**

Made with ❤️ by TalentSync Team

</div>
