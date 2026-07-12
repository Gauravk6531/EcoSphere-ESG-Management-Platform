# EcoSphere ESG Management Platform

EcoSphere is a full-stack ESG management platform built with the requested MERN-style architecture:

- Frontend: React + Vite + Tailwind-ready structure + Material UI-ready structure
- Backend: Node.js + Express.js
- Database: MongoDB Atlas or local MongoDB
- Authentication: JWT + bcrypt foundation
- Charts: Recharts
- Reports: PDFKit + ExcelJS + CSV
- Deployment target: Vercel frontend, Render backend, MongoDB Atlas database

## Project Structure

```text
ecosphere-esg-platform/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/
│       │   ├── layout/
│       │   ├── forms/
│       │   ├── cards/
│       │   ├── tables/
│       │   └── charts/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── context/
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── config/
│   ├── middleware/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── uploads/
│   ├── app.js
│   └── server.js
├── docs/
├── .github/
├── README.md
└── .gitignore
```

## Member 2 Scope

This branch includes the Social Module and Gamification Module:

- Master Data: Categories, Badges, Rewards
- Social Module: CSR Activities, Employee Participation, Diversity Metrics, Training Completion, Social Dashboard, Social Reports
- Gamification Module: Challenges, Challenge Participation, XP Calculation, Badge Auto Award, Reward Redemption, Leaderboard
- MongoDB collections: Categories, CSRActivities, EmployeeParticipations, TrainingCompletions, Challenges, ChallengeParticipations, Badges, EmployeeBadges, Rewards, RewardRedemptions

## Quick Start

### Docker

```bash
docker compose up --build
```

Services:

- Client: http://localhost:5173
- Server: http://localhost:8000
- MongoDB: mongodb://localhost:27017/ecosphere

Seed demo data:

```bash
docker compose exec server npm run seed
```

### Manual Setup

Start MongoDB locally or use MongoDB Atlas, then configure `server/.env`.

Backend:

```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

Frontend:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Main API Groups

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET/POST /api/categories`
- `GET/POST /api/social/activities`
- `GET/POST /api/social/participations`
- `POST /api/social/participations/:id/decision`
- `GET/POST /api/social/training-completions`
- `GET /api/social/dashboard`
- `GET/POST /api/gamification/challenges`
- `GET/POST /api/gamification/challenge-participations`
- `POST /api/gamification/challenge-participations/:id/decision`
- `GET/POST /api/gamification/badges`
- `GET/POST /api/gamification/rewards`
- `POST /api/gamification/rewards/redeem`
- `GET /api/gamification/leaderboard`
- `GET /api/reports/custom`

Reports support JSON on screen and `export=csv`, `export=xlsx`, or `export=pdf`.
