# TalentSync 项目文档

> AI驱动的智能求职助手 - 简历分析、职位匹配、求职信生成

---

## 1. 项目概览

JobsAI 是一个全栈 JavaScript 应用，帮助求职者通过 AI 分析简历与职位匹配度、模拟面试、生成求职信。

### 目录结构

```
JobsAI/
├── backend/           # Node.js/Express REST API
│   ├── models/        # Mongoose 数据模型
│   ├── controllers/   # 业务逻辑控制器
│   ├── routes/        # API 路由定义
│   ├── services/      # AI、解析等服务
│   ├── middleware/    # 认证、订阅、上传中间件
│   ├── config/        # 配置文件
│   ├── uploads/       # 简历文件存储
│   └── app.js         # Express 入口
├── frontend/          # React 18 SPA
│   ├── pages/         # 页面组件
│   ├── components/    # UI 组件
│   ├── store/         # Redux 状态管理
│   ├── services/      # API 服务
│   └── App.js         # 路由入口
└── package.json       # 根级配置
```

---

## 2. 技术栈

### Backend
| 类别 | 技术 |
|------|------|
| 运行时 | Node.js |
| 框架 | Express.js v4.21.2 |
| 数据库 | MongoDB + Mongoose v8.13.0 |
| 认证 | JWT + Google OAuth 2.0 + bcryptjs |
| AI | OpenAI (GPT-4o, o1) + Google Gemini |
| 支付 | Stripe v18.1.0 |
| 文件 | multer + pdf-parse + pdfkit |

### Frontend
| 类别 | 技术 |
|------|------|
| 框架 | React 18.2.0 |
| 路由 | react-router-dom v6.30.0 |
| 状态管理 | Redux Toolkit v2.6.1 |
| 样式 | Tailwind CSS + Material-UI v7.0.0 |
| 动画 | Framer Motion v12.12.1 |
| PDF | jspdf + html2pdf.js |

---

## 3. 数据库模型

### User (用户)
```javascript
{
  name: String,              // 用户名 (必填, max 50)
  email: String,             // 邮箱 (必填, 唯一)
  password: String,          // 密码 (可选, bcrypt加密)
  subscriptionStatus: "free" | "premium" | "enterprise",
  activeSubscription: ObjectId -> Subscription,
  authProviders: ["google", "local"],
  googleProfile: { name, picture, email },
  resumes: [ObjectId -> Resume],
  activeResume: ObjectId -> Resume,
  createdAt, updatedAt
}
```

### Subscription (订阅)
```javascript
{
  userId: ObjectId -> User,
  subscriptionType: "free" | "premium" | "enterprise",
  startDate: Date,
  endDate: Date,
  status: "active" | "cancelled" | "expired",
  paymentId: String,         // Stripe ID
  features: {
    gemini: Boolean,         // 所有用户可用
    gpt4o: Boolean,          // premium+
    o1: Boolean              // enterprise only
  },
  dailyUsage: {
    gpt4oResumeAnalysis: Number,
    gpt4oCoverLetter: Number
  },
  lastUsageReset: Date
}
```

### Resume (简历)
```javascript
{
  user: ObjectId -> User,
  name: String,
  originalFile: { fileName, fileUrl, uploadDate },
  isActive: Boolean,
  basicInfo: { fullName, email, phone, location, links[] },
  education: [{ institution, degree, major, GPA, dates, courses[] }],
  experience: [{ company, position, location, dates, descriptions[] }],
  projects: [{ name, descriptions[], links[] }],
  skills: [{ category, items[] }],
  honors: [{ title, date }]
}
```

### UserJob (职位)
```javascript
{
  user: ObjectId -> User,
  title: String,
  company: String,
  location: String,
  description: String,       // 完整JD
  requirements: [],
  preferred_qualifications: [],
  tech_stack: [],
  original_text: String,
  status: "saved" | "applied" | "interviewing" | "offered" | "rejected"
}
```

### Analysis (分析结果)
```javascript
{
  userId, resumeId, jobId: ObjectId,
  overallMatchScore: Number,
  ats_analysis: {
    match_score_percent,
    missing_keywords[],
    format_check: { bullets, headers, consistency, verb_driven },
    ats_pass_probability,
    improvement_suggestions[]
  },
  ranking_analysis: {
    predicted_rank_percentile,
    estimated_total_applicants,
    top_5_diff[]
  },
  hr_analysis: {
    initial_impression,
    recommend_interview: Boolean,
    expression_issues[]
  },
  technical_analysis: {
    trust_level: "low" | "medium" | "high",
    red_flags[],
    expected_tech_questions[]
  }
}
```

### CoverLetter (求职信)
```javascript
{
  userId, resumeId, jobId: ObjectId,
  recipient: String,
  subject: String,
  paragraphs: [],
  closing: String,
  signature: String,
  highlights: [],
  suggestions: [],
  model: String
}
```

### Interview (面试)
```javascript
{
  user, job, resume: ObjectId,
  currentSession: ObjectId -> Session,
  status: "pending" | "active" | "completed" | "cancelled",
  settings: {
    maxRounds: 10,
    language: "zh-CN",
    difficulty,
    maxTime: 1800
  },
  behavioralRounds, technicalRounds, followUpDepth
}
```

---

## 4. API 端点

### 认证 `/api/auth`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /register | 注册 | - |
| POST | /login | 登录 | - |
| GET | /google | Google OAuth | - |
| GET | /google/callback | OAuth回调 | - |
| GET | /me | 获取当前用户 | 需要 |
| GET | /logout | 登出 | 需要 |

### 简历 `/api/resumes`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /upload | 上传简历 (PDF/DOCX, 10MB) | 需要 |
| GET | / | 获取所有简历 | 需要 |
| GET | /active | 获取激活简历 | 需要 |
| GET | /:id | 获取简历详情 | 需要 |
| PUT | /:id/set-active | 设为激活 | 需要 |
| PUT | /:id | 更新简历 | 需要 |
| DELETE | /:id | 删除简历 | 需要 |

### 职位 `/api/jobs`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /parse | 解析JD文本 | 需要 |
| POST | / | 保存职位 | 需要 |
| GET | /user | 获取用户职位 | 需要 |
| GET | /:id | 获取职位详情 | 需要 |
| PUT | /:id | 更新职位 | 需要 |
| DELETE | /:id | 删除职位 | 需要 |

### 分析 `/api/analysis`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | / | 创建分析 (需订阅检查) | 需要 |
| GET | /:id | 获取分析结果 | 需要 |
| GET | / | 获取用户所有分析 | 需要 |
| GET | /job/:jobId | 获取指定职位分析 | 需要 |

### 支付 `/api/payment`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /create-checkout-session | 创建Stripe结账 | 需要 |
| POST | /webhook | Stripe webhook | - |
| GET | /get-subscription-status | 获取订阅状态 | 需要 |
| POST | /cancel-subscription | 取消订阅 | 需要 |

### 求职信 `/api/cover-letters`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | / | 创建求职信 | 需要 |
| GET | /:id | 获取求职信 | 需要 |
| GET | / | 获取用户所有求职信 | 需要 |
| GET | /:id/download | 下载PDF | 需要 |

### 面试 `/api/interviews`
| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | / | 创建面试 | 需要 |
| GET | /:id | 获取面试详情 | 需要 |
| POST | /message | 发送面试消息 | 需要 |

---

## 5. 核心功能

### A. 订阅系统
| 等级 | Gemini | GPT-4o | GPT-o1 | 价格 |
|------|--------|--------|--------|------|
| Free | 无限 | 1次/天 | - | $0 |
| Premium | 无限 | 无限 | - | 付费 |
| Enterprise | 无限 | 无限 | 无限 | 付费 |

### B. 简历分析维度
1. **ATS分析**: 关键词匹配、格式检查、通过概率
2. **排名分析**: 预测排名百分位、与Top候选人对比
3. **HR分析**: 第一印象、面试推荐、表达问题
4. **技术分析**: 可信度、红旗、预期面试问题

### C. AI面试模拟
- 10轮面试 (2轮行为 + 8轮技术)
- 基于简历和JD的上下文问题
- 2-3层跟进深度
- 综合评分和建议

---

## 6. 环境配置

### Backend `.env`
```env
MONGO_URI=mongodb://localhost:27017/ai_interview_assistant
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=your_jwt_secret
PORT=3001
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:3001
```

---

## 7. 认证系统

### JWT认证
- **存储**: localStorage `token`
- **有效期**: 30天
- **Header**: `Authorization: Bearer <token>`

### Google OAuth
- **回调**: `/api/auth/google/callback`
- **Scopes**: userinfo.profile, userinfo.email

### 订阅权限中间件
```javascript
checkSubscription(action) // action: 'gpt4oResumeAnalysis', 'coverLetter', etc.
```

---

## 8. 文件上传

- **存储目录**: `backend/uploads/`
- **命名格式**: `resume-{timestamp}-{random}.{ext}`
- **支持格式**: PDF, DOCX
- **大小限制**: 10MB

---

## 9. Redux 状态管理

```
store/
├── authSlice.js    # isAuthenticated, user, token, loading, error
├── userSlice.js    # subscriptionStatus, dailyUsage, error
└── userActions.js  # logout, fetchSubscriptionStatus, fetchUserUsage
```

---

## 10. 启动命令

### 开发环境
```bash
# Backend (端口 3001)
cd backend && npm install && npm start

# Frontend (端口 3000)
cd frontend && npm install && npm start
```

### 依赖重装
```bash
# 清理并重装
cd backend && rm -rf node_modules && npm install
cd frontend && rm -rf node_modules && npm install
```

---

## 11. 关键文件参考

| 文件 | 用途 |
|------|------|
| `backend/app.js` | Express服务器入口, 路由挂载 |
| `backend/models/User.js` | 用户模型, 密码加密, JWT生成 |
| `backend/models/Subscription.js` | 订阅逻辑, 使用量追踪 |
| `backend/controllers/auth.js` | 认证逻辑 |
| `backend/controllers/paymentController.js` | Stripe支付处理 |
| `backend/services/aiService.js` | AI API集成 |
| `backend/middleware/checkSubscription.js` | 订阅权限检查 |
| `frontend/App.js` | 路由配置 |
| `frontend/store/userSlice.js` | 订阅状态管理 |

---

## 12. 数据流示例

### 简历分析流程
1. 用户登录 → JWT存储 → Redux更新
2. 上传简历 → `/api/resumes/upload` → 解析存储
3. 提交JD → `/api/jobs/parse` → 解析存储
4. 点击分析 → `/api/analysis` → AI处理 → 存储结果
5. 显示报告页面

### 订阅升级流程
1. 点击升级 → `/api/payment/create-checkout-session`
2. Stripe结账 → 支付完成
3. Webhook触发 → 创建Subscription记录
4. 前端刷新订阅状态

---

## 13. 测试运营版配置 (2026-01-13)

### 当前状态
**测试运营版** - 所有功能免费开放给所有用户，Stripe 支付功能暂时禁用。

### 已修改的文件

#### 1. 后端：订阅检查中间件
**文件**: `backend/middleware/checkSubscription.js`

```javascript
// 第 8 行
const DISABLE_SUBSCRIPTION_CHECK = true;  // 改为 false 恢复付费限制
```

**作用**: 跳过所有订阅权限检查，允许所有用户使用所有功能（包括 GPT-4o、GPT-o1）。

#### 2. 前端：定价组件
**文件**: `frontend/src/components/dashboard/PricingSection.js`

```javascript
// 第 12 行
const DISABLE_PAYMENT = true;  // 改为 false 恢复支付功能
```

**作用**: 点击"立即升级"或"联系销售"按钮时显示提示弹窗，而不是跳转到支付页面。

#### 3. 前端：支付页面
**文件**: `frontend/src/pages/payment/PaymentPage.js`

```javascript
// 第 9 行
const DISABLE_PAYMENT = true;  // 改为 false 恢复支付功能
```

**作用**: 如果用户直接访问 `/payment` 页面，显示"支付功能暂未开放"提示。

#### 4. 前端：模型选择组件
**文件**: `frontend/src/components/dashboard/UploadSection.js`

```javascript
// 第 25 行
const DISABLE_SUBSCRIPTION_CHECK = true;  // 改为 false 恢复模型限制
```

**作用**: 允许所有用户选择和使用所有 AI 模型（Gemini、GPT-4o、GPT-o1）。

### 如何恢复付费功能

1. **恢复后端订阅限制**:
   ```bash
   # 编辑 backend/middleware/checkSubscription.js
   # 将第 8 行改为:
   const DISABLE_SUBSCRIPTION_CHECK = false;
   ```

2. **恢复前端支付和模型限制**:
   ```bash
   # 编辑 frontend/src/components/dashboard/PricingSection.js
   # 将第 12 行改为:
   const DISABLE_PAYMENT = false;

   # 编辑 frontend/src/pages/payment/PaymentPage.js
   # 将第 9 行改为:
   const DISABLE_PAYMENT = false;

   # 编辑 frontend/src/components/dashboard/UploadSection.js
   # 将第 25 行改为:
   const DISABLE_SUBSCRIPTION_CHECK = false;
   ```

3. **配置 Stripe 生产环境** (如需上线):
   - 在 Stripe Dashboard 切换到 Live 模式
   - 获取 Live API Keys (`pk_live_`, `sk_live_`)
   - 创建 Live 产品和价格
   - 配置 Live Webhook
   - 更新 Railway 环境变量

4. **重新部署**:
   ```bash
   git add .
   git commit -m "恢复付费功能"
   git push
   ```

### 用户反馈邮箱
songzhiyuan98@gmail.com

---

*文档生成时间: 2026-01-13*
*最后更新: 2026-01-13 (测试运营版配置)*
