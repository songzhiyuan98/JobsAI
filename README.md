# 项目规则与技术规范

## 项目目录结构

```
JobsAI/
├── backend/                        # 后端服务
│   ├── app.js                      # Express 应用入口
│   ├── setup.js                    # 初始化设置
│   ├── models/                     # Mongoose 数据模型
│   │   ├── User.js                 # 用户模型
│   │   ├── Subscription.js         # 会员订阅模型
│   │   ├── Resume.js               # 简历模型
│   │   ├── Analysis.js             # 智能分析模型
│   │   ├── Interview.js            # 面试相关模型
│   │   ├── Session.js              # 会话模型
│   │   └── UserJob.js              # 用户职位关联
│   ├── controllers/                # 业务控制器
│   │   ├── auth.js                 # 用户认证
│   │   ├── paymentController.js    # Stripe 支付与订阅
│   │   ├── resumeController.js     # 简历相关
│   │   ├── jobController.js        # 职位相关
│   │   ├── analysisController.js   # 智能分析
│   │   └── interviewController.js  # 面试相关
│   ├── routes/                     # 路由定义
│   │   ├── auth.js                 # 用户认证路由
│   │   ├── payment.js              # 支付与订阅路由
│   │   ├── resumeRoutes.js         # 简历路由
│   │   ├── jobRoutes.js            # 职位路由
│   │   ├── analysisRoutes.js       # 智能分析路由
│   │   └── interviewRoutes.js      # 面试路由
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
│   ├── config/                     # 配置文件
│   │   └── googleOAuth.js          # Google OAuth 配置
│   ├── uploads/                    # 文件上传目录
│   ├── temp/                       # 临时文件目录
│   └── src/                        # 源代码目录
├── frontend/                       # 前端项目
│   ├── src/
│   │   ├── App.js                  # 前端主入口
│   │   ├── index.js                # React 入口
│   │   ├── pages/                  # 页面级组件
│   │   │   ├── LoginPage.js        # 登录页
│   │   │   ├── RegisterPage.js     # 注册页
│   │   │   ├── Dashboard.js        # 仪表盘主面板
│   │   │   ├── PersonalCenter.js        # 个人中心主面板
│   │   │   ├── personalcenter/     # 个人中心子页面
│   │   │   │   ├── OverviewSection.js   # 个人中心-概览
│   │   │   │   ├── ProfileSection.js    # 个人中心-资料卡
│   │   │   │   ├── ResumeSection.js     # 个人中心-简历区
│   │   │   │   ├── AnalysisSection.js   # 个人中心-分析区
│   │   │   ├── payment/           # 支付相关页面
│   │   │   │   ├── PaymentPage.js      # 会员支付页
│   │   │   │   ├── PaymentSuccess.js   # 支付成功页
│   │   │   │   ├── PaymentCancel.js    # 支付取消页
│   │   │   ├── JobManagerPage.js   # 职位管理
│   │   │   ├── AnalysisStartPage.js# 智能分析入口
│   │   │   ├── AnalysisResultPage.js# 智能分析结果
│   │   │   └── ...                 # 其他页面
│   │   ├── components/             # 复用型组件
│   │   │   ├── Navbar.js           # 顶部导航栏
│   │   │   ├── ProtectedRoute.js   # 路由保护
│   │   │   ├── dashboard/          # 仪表盘相关组件
│   │   │   │   ├── PricingSection.js # 会员价格与操作区
│   │   │   │   ├── UploadSection.js  # 简历上传区
│   │   │   │   ├── UserProfile.js    # 用户信息卡片
│   │   │   │   ├── LoadingMaskAI.js  # AI加载动画
│   │   │   │   └── ...               # 其他仪表盘组件
│   │   │   ├── job/                 # 职位相关组件
│   │   │   ├── resume/              # 简历相关组件
│   │   │   ├── analysis/            # 智能分析相关组件
│   │   │   └── AITypingAnimation.js # AI 打字动画
│   │   ├── store/                   # Redux 相关
│   │   │   ├── userSlice.js         # 用户/会员状态
│   │   │   ├── userActions.js       # 用户相关异步 action
│   │   │   ├── authSlice.js         # 登录状态
│   │   │   └── index.js             # store 入口
│   │   ├── services/                # API 封装
│   │   ├── styles/                  # 全局样式
│   │   ├── assets/                  # 静态资源
│   │   └── ...                      # 其他前端相关
├── .cursor/rules/                   # AI/项目规则
│   ├── projectrule.mdc              # 项目级规则
│   └── customrule.mdc               # AI 行为规则
└── README.md                        # 项目说明
```

## 技术栈与风格

- 前端：React 18 + Redux Toolkit + Tailwind CSS，所有组件为函数式组件，禁止 class 组件。
- 后端：Node.js + Express + Mongoose，所有模型放在 backend/models，控制器放在 backend/controllers。
- API 请求统一用 axios，所有 API 路径以 /api/ 开头，API 封装在 src/services 下。
- 状态管理：Redux Toolkit，所有 slice/action 放在 src/store 下，action 命名统一为 setXxxStatus、clearXxxStatus。
- 路由：react-router-dom，所有页面放在 src/pages 下，受保护页面用 ProtectedRoute 包裹。
- 统一使用 ES6+ 语法，所有异步操作用 async/await。
- 组件、函数、变量命名采用 camelCase，组件文件名用大驼峰（如 PricingSection.js）。
- 重要业务流程、接口、hook 必须有注释说明。

## 主要接口与数据结构

- 用户认证：

  - POST /api/auth/register：注册，返回 { data: userObject }
  - POST /api/auth/login：登录，返回 { data: userObject }
  - GET /api/auth/google：Google OAuth 登录跳转
  - GET /api/auth/google/callback：Google OAuth 回调
  - GET /api/auth/me：获取当前用户信息，返回 { data: userObject }
  - GET /api/auth/logout：退出登录

- 订阅与支付：

  - POST /api/payment/create-checkout-session：创建 Stripe 订阅支付会话，返回 { url }
  - POST /api/payment/webhook：Stripe webhook，处理 checkout.session.completed 事件，写入订阅记录
  - GET /api/payment/get-subscription-status：获取当前用户订阅状态，返回 { data: { subscriptionType, features, endDate, ... } }
  - POST /api/payment/cancel-subscription：取消 Stripe 订阅，自动取消自动续费并同步数据库

- 简历管理：

  - POST /api/resumes/upload：上传简历，需要文件上传中间件
  - GET /api/resumes：获取用户所有简历
  - GET /api/resumes/active：获取当前激活的简历
  - GET /api/resumes/:id：获取单个简历详情
  - PUT /api/resumes/:id/set-active：设置简历为激活状态
  - PUT /api/resumes/:id/verify：验证并更新简历
  - PUT /api/resumes/:id：更新简历
  - DELETE /api/resumes/:id：删除简历

- 职位管理：

  - POST /api/jobs/parse：解析职位描述文本
  - POST /api/jobs：保存用户职位描述
  - GET /api/jobs/user：获取用户保存的所有职位
  - GET /api/jobs/:id：获取单个职位详情
  - PUT /api/jobs/:id：更新职位
  - DELETE /api/jobs/:id：删除职位

- 智能分析：

  - POST /api/analysis：创建分析
  - GET /api/analysis/:id：获取分析详情
  - GET /api/analysis：获取用户所有分析
  - GET /api/analysis/job/:jobId：获取职位相关的分析报告
  - POST /api/analysis/upload-analyze：上传简历+JD 并分析，需要文件上传中间件

- 面试相关：
  - POST /api/interview：创建面试
  - GET /api/interview/:id：获取面试详情
  - POST /api/interview/message：发送面试消息

## 业务规范与 UI/UX

- 用户分为 free、premium、enterprise 三种订阅类型，权限依赖 subscriptionType 字段。
- 会员升级为企业时，原有 premium 订阅自动取消，数据库只保留一条 active 订阅。
- 取消订阅时，需调用 Stripe API 取消自动续费，并同步数据库状态。
- Stripe webhook 只处理 checkout.session.completed 事件，写入订阅记录时 endDate 必须为 Stripe subscription 的 current_period_end。
- 前端会员状态需通过 /api/payment/get-subscription-status 拉取，并同步到 Redux。
- PricingSection 页面：当前计划按钮显示"取消订阅"并可点击，其他计划按钮始终可点击（除非已是 enterprise），升级/联系销售按钮跳转支付或销售页面。
- 会员状态、权限、模型选择等 UI 只依赖 Redux 状态，禁止直接用 localStorage。
- 退出登录时，Redux 和 localStorage 必须全部清空会员状态。
- 会员相关操作（升级、取消、支付成功）后，必须重新拉取订阅状态并同步 Redux。
- 重要操作（如取消订阅）需二次确认弹窗。
- 错误需有用户友好的提示，后端接口出错时返回 { message: string }。

## 其他

- 项目所有规则、接口、权限、风格等需在 README.md 和 projectrule.mdc 里同步更新，便于团队协作和 AI 辅助开发。
