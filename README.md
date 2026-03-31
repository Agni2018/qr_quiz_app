# QR Quiz Platform

A modern, gamified learning platform that enables interactive quiz-taking with real-time analytics, badge rewards, and a comprehensive admin management system.

## 🚀 Key Features

### For Students
- **Interactive Quizzes**: Take quizzes on various topics with immediate feedback.
- **Level Progression**: Dynamic difficulty scaling and point systems.
- **Badge System**: Earn rewards for performance milestones and consistency.
- **Weekly Challenges**: Compete in time-limited global challenges.
- **Performance Analytics**: Visualized tracking of quiz attempts and topic mastery.
- **Certificates**: Generate and download professional certificates for high scores.
- **Study Materials**: Access and download curated learning guides.
- **Leaderboards**: Track rankings across topics and globally.

### For Admins
- **Topic & Question Management**: Full CRUD capabilities with advanced settings (negative marking, time-based scoring).
- **Badge Management**: Create and assign performance-based reward tiers.
- **Study Material Portal**: Centralized upload system for PDFs and other resources.
- **Advanced Analytics**: Monitor student progress, engagement, and topic performance.
- **Messaging System**: Direct communication with students for feedback and support.
- **Referral Tracking**: Monitor platform growth through incentivized student referrals.

## 🛠️ Architecture & Tech Stack

The platform follows a modern MERN (MongoDB, Express, React, Node) architecture with a Next.js frontend:

- **Frontend**: 
  - [Next.js](https://nextjs.org/) (App Router, TypeScript)
  - [Tailwind CSS](https://tailwindcss.com/) for modern, responsive UI
  - [Framer Motion](https://www.framer.com/motion/) for smooth animations
  - [Axios](https://axios-http.com/) for reliable API communication
- **Backend**:
  - [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) REST API
  - [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
  - [JWT](https://jwt.io/) for secure, cookie-based authentication
  - [Multer](https://github.com/expressjs/multer) for efficient file uploads
- **Deployment**:
  - [Docker](https://www.docker.com/) for containerized environment consistency

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Create a new student account |
| `POST` | `/login` | Authenticate and set Secure/HTTP-only cookie |
| `POST` | `/logout` | Terminate session and clear cookies |
| `GET` | `/status` | Verify current session and retrieve user data |
| `POST` | `/referrals/create` | Generate a unique referral link |
| `GET` | `/referrals/my` | View registered referrals and status |

### Quizzes & Analytics (`/api/quiz`, `/api/analytics`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/quiz/start` | Check eligibility and initialize attempt |
| `POST` | `/api/quiz/submit` | Finalize attempt, calculate score/bonus |
| `GET` | `/api/quiz/result/:id` | Detailed score report with breakdown |
| `GET` | `/api/quiz/leaderboard/:id` | Topic-specific student rankings |
| `GET` | `/api/analytics/overview` | High-level platform statistics (Admin) |
| `GET` | `/api/analytics/global-leaderboard` | Top performers across all categories |

### Content Management (`/api/topics`, `/api/questions`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/topics` | List all available quiz subjects |
| `POST` | `/api/topics` | Create a new subject with custom rules |
| `POST` | `/api/questions` | Add a question to a specific topic |
| `GET` | `/api/study-materials` | Fetch learning resources and downloads |

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or on Atlas)
- Docker Desktop (Optional but recommended)

### Quick Run (Docker)
The easiest way to start the entire stack:
```bash
docker-compose up --build
```

### Manual Installation

**1. Backend**
```bash
cd backend
npm install
npm run dev
```

**2. Frontend**
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Environment Variables

### Backend (`/backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://localhost:21017/quiz_platform
JWT_SECRET=your_jwt_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:3000
```

---
*Created with ❤️ by the Antigravity Team*
