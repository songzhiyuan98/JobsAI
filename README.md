# 🚀 TalentSync

> AI-Powered Career Assistant | AI驱动的智能求职助手
> 
> Resume Analysis, Job Matching, Cover Letter Generation, Interview Simulation
> 简历分析、职位匹配、求职信生成、面试模拟

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://talentsync-green.vercel.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)](https://www.mongodb.com/)

## 📖 Project Overview | 项目简介

TalentSync is a full-stack web application that helps job seekers improve their success rate through AI technology. The platform provides resume-to-job matching analysis, intelligent cover letter generation, AI interview simulation, and more. It supports multiple AI models (GPT-4o, GPT-o1, Google Gemini) to help users optimize resumes, target applications, and enhance interview performance.

TalentSync 是一个全栈 Web 应用，帮助求职者通过 AI 技术提升求职成功率。平台提供简历与职位匹配度分析、智能求职信生成、AI 面试模拟等核心功能，支持多种 AI 模型（GPT-4o、GPT-o1、Google Gemini），帮助用户优化简历、精准投递、提升面试表现。

### 🌐 Live Demo | 在线演示

**🔗 [Visit Demo | 访问演示](https://talentsync-green.vercel.app)**

> Currently in test mode - all features are free to experience
> 当前为测试运营版本，所有功能免费开放体验

---

## ✨ Core Features | 核心功能

### 📊 Resume-to-Job Matching Analysis | 简历与职位匹配分析
- **ATS Analysis | ATS 分析**: Keyword matching, format checking, pass probability assessment
- **Ranking Analysis | 排名分析**: Predict ranking percentile, compare with top candidates
- **HR Analysis | HR 分析**: First impression assessment, interview recommendation, expression issue identification
- **Technical Analysis | 技术分析**: Credibility assessment, risk identification, expected interview questions

### ✍️ Intelligent Cover Letter Generation | 智能求职信生成
- Automatically generate personalized cover letters based on resume and target job
- Highlight relevant experience and skill matching
- Support multiple languages and styles
- One-click PDF export

### 💼 Job Management | 职位管理
- Intelligent job description parsing (JD Parsing)
- Structured job information storage
- Job status tracking (Saved, Applied, Interviewing, Offered, Rejected)

### 🤖 AI Interview Simulation | AI 面试模拟
- 10-round interview simulation (2 behavioral + 8 technical rounds)
- Context-aware question generation based on resume and JD
- 2-3 levels of follow-up depth
- Comprehensive scoring and improvement suggestions

### 🔐 User System | 用户系统
- Email registration/login
- Google OAuth 2.0 login
- JWT authentication
- Subscription management (Free, Premium, Enterprise)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.2.0
- **Routing**: react-router-dom v6.30.0
- **State Management**: Redux Toolkit v2.6.1
- **Styling**: Tailwind CSS + Material-UI v7.0.0
- **Animation**: Framer Motion v12.12.1
- **PDF Processing**: jspdf + html2pdf.js
- **Charts**: ECharts v5.6.0

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v4.21.2
- **Database**: MongoDB + Mongoose v8.13.0
- **Authentication**: JWT + Google OAuth 2.0 + bcryptjs
- **AI Services**: OpenAI (GPT-4o, GPT-o1) + Google Gemini
- **Payment**: Stripe v18.1.0
- **File Processing**: multer + pdf-parse + pdfkit

### Deployment
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: MongoDB Atlas

---

## 📁 Project Structure

```
TalentSync/
├── backend/                        # Backend service
│   ├── app.js                      # Express app entry
│   ├── setup.js                    # Initialization
│   ├── models/                     # Mongoose models
│   │   ├── User.js                 # User model
│   │   ├── Subscription.js         # Subscription model
│   │   ├── Resume.js               # Resume model
│   │   ├── Analysis.js             # Analysis model
│   │   ├── CoverLetter.js          # Cover letter model
│   │   ├── Interview.js            # Interview model
│   │   └── UserJob.js              # User-job relation
│   ├── controllers/                # Business controllers
│   ├── routes/                     # Route definitions
│   ├── middleware/                 # Middleware
│   ├── services/                   # Business services
│   └── config/                     # Configuration
├── frontend/                       # Frontend project
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   ├── components/             # Reusable components
│   │   ├── store/                  # Redux state management
│   │   └── services/               # API services
│   └── public/                     # Static assets
└── README.md                       # Project documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/talentsync.git
cd talentsync
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**

Create `backend/.env`:
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

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:3001
```

5. **Start development servers**

Start backend (port 3001):
```bash
cd backend
npm start
```

Start frontend (port 3000):
```bash
cd frontend
npm start
```

6. **Access the application**

Open [http://localhost:3000](http://localhost:3000) in your browser

---

## 📡 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/logout` - Logout

### Resume Management
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get all resumes
- `GET /api/resumes/active` - Get active resume
- `PUT /api/resumes/:id/set-active` - Set active resume
- `DELETE /api/resumes/:id` - Delete resume

### Job Management
- `POST /api/jobs/parse` - Parse job description
- `POST /api/jobs` - Save job
- `GET /api/jobs/user` - Get user's jobs
- `GET /api/jobs/:id` - Get job details

### Analysis
- `POST /api/analysis` - Create analysis
- `GET /api/analysis/:id` - Get analysis details
- `GET /api/analysis` - Get user's analyses

### Cover Letters
- `POST /api/cover-letters` - Generate cover letter
- `GET /api/cover-letters/:id` - Get cover letter
- `GET /api/cover-letters/:id/download` - Download PDF

### Payment & Subscription
- `POST /api/payment/create-checkout-session` - Create payment session
- `GET /api/payment/get-subscription-status` - Get subscription status
- `POST /api/payment/cancel-subscription` - Cancel subscription

For more API details, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

## 🎯 Subscription Plans | 订阅计划

| Feature | Free | Premium | Enterprise |
|---------|------|---------|------------|
| Gemini Model | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| GPT-4o Analysis | 1/day | ✅ Unlimited | ✅ Unlimited |
| GPT-o1 Analysis | ❌ | ❌ | ✅ Unlimited |
| Cover Letter Generation | ✅ | ✅ | ✅ |
| Interview Simulation | ✅ | ✅ | ✅ |

---

## 🔒 Security Features

- JWT Token authentication
- Password bcrypt encryption
- Google OAuth 2.0 secure login
- Stripe secure payment integration
- File upload size limit (10MB)
- CORS configuration
- Helmet security headers

---

## 📝 Development Guidelines

- **Frontend**: React functional components only, no class components
- **State Management**: Redux Toolkit with unified action naming
- **API Requests**: Use axios, all API paths start with `/api/`
- **Code Style**: ES6+ syntax, use async/await
- **Naming**: camelCase (variables/functions), PascalCase (component files)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact | 联系方式

- **Email**: songzhiyuan98@gmail.com
- **Project Link**: [https://github.com/your-username/talentsync](https://github.com/your-username/talentsync)
- **Live Demo**: [https://talentsync-green.vercel.app](https://talentsync-green.vercel.app)

---

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) - GPT-4o, GPT-o1 API
- [Google Gemini](https://gemini.google.com/) - Gemini API
- [Stripe](https://stripe.com/) - Payment services
- [Vercel](https://vercel.com/) - Frontend deployment
- [Railway](https://railway.app/) - Backend deployment

---

<div align="center">

**⭐ If this project helps you, please give it a Star! ⭐**

Made with ❤️ by TalentSync Team

</div>
