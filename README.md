# EcoSphere — ESG Management Platform

Full-stack implementation of the EcoSphere ESG Management Platform:
- **Frontend:** React (Vite)
- **Backend:** Python (FastAPI)
- **Database:** PostgreSQL

Covers all four core modules — **Environmental, Social, Governance, Gamification** — plus a unified dashboard, custom report builder, notifications, reward redemption, and badge auto-award engine, per the EcoSphere spec.

---

## 1. Project Structure

```
ecosphere/
├── backend/                 FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── main.py          App entrypoint, CORS, router registration
│   │   ├── database.py      SQLAlchemy engine/session setup
│   │   ├── models.py        All ORM models (master + transactional data)
│   │   ├── schemas.py       Pydantic request/response schemas
│   │   ├── routers/         API endpoints grouped by module
│   │   │   ├── core.py            departments, categories, employees, notifications, settings
│   │   │   ├── environmental.py   emission factors, carbon transactions, goals, product profiles
│   │   │   ├── social.py          CSR activities, participation, diversity snapshot
│   │   │   ├── governance.py      policies, acknowledgements, audits, compliance issues
│   │   │   ├── gamification.py    badges, rewards, challenges, leaderboard
│   │   │   └── dashboard.py       ESG scoring dashboard + custom report builder
│   │   └── services/        Business logic
│   │       ├── scoring_service.py     Environmental/Social/Governance/Total score engine
│   │       ├── badge_service.py       Badge auto-award engine
│   │       ├── notification_service.py
│   │       └── config_service.py
│   ├── seed_data.py         Optional demo data loader
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                 React (Vite) SPA
│   ├── src/
│   │   ├── main.jsx / App.jsx
│   │   ├── AppContext.jsx    Global state: employees, departments, "current user" selector
│   │   ├── api/               Axios client + typed API calls
│   │   ├── components/        Shared UI (notification bell, status pills, etc.)
│   │   └── pages/              Overview, Environmental, Social, Governance, Gamification, Reports, Settings
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── docker-compose.yml        Spins up Postgres + backend + frontend together
```

---

## 2. Quick Start (Docker — recommended)

Requires Docker + Docker Compose installed.

```bash
cd ecosphere
docker compose up --build
```

This starts:
- PostgreSQL on `localhost:5432`
- FastAPI backend on `http://localhost:8000` (docs at `http://localhost:8000/docs`)
- React frontend on `http://localhost:5173`

Then, in a separate terminal, load demo data (departments, employees, sample transactions, etc.) so the dashboard isn't empty:

```bash
docker compose exec backend python seed_data.py
```

Open **http://localhost:5173** in your browser.

---

## 3. Manual Setup (without Docker)

### 3.1 PostgreSQL
Install PostgreSQL locally, then create the database and user:

```sql
CREATE USER ecosphere_user WITH PASSWORD 'ecosphere_pass';
CREATE DATABASE ecosphere_db OWNER ecosphere_user;
```

### 3.2 Backend (Python 3.11+)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env if your Postgres credentials differ

python seed_data.py             # optional: load demo data
uvicorn app.main:app --reload --port 8000
```

API is now live at `http://localhost:8000` (interactive docs at `/docs`).
Tables are auto-created on startup via `Base.metadata.create_all` — no manual migration needed for first run. For ongoing schema changes in production, introduce Alembic.

### 3.3 Frontend (Node 18+)

```bash
cd frontend
npm install
cp .env.example .env            # points VITE_API_URL at the backend
npm run dev
```

Visit `http://localhost:5173`.

---

## 4. How the Spec Maps to This Implementation

| Spec Section | Where it lives |
|---|---|
| Master Data (Department, Category, Emission Factor, Product ESG Profile, Environmental Goal, ESG Policy, Badge, Reward) | `backend/app/models.py`, CRUD in respective routers |
| Transactional Data (Carbon Transaction, CSR Activity, Employee Participation, Challenge, Challenge Participation, Policy Acknowledgement, Audit, Compliance Issue, Department Score) | `backend/app/models.py` + routers |
| Business Workflow (Master config → operations → Carbon Transactions → participation/audits → E/S/G scores → Total Score → Overall ESG Score → Dashboard) | `services/scoring_service.py`, surfaced via `/api/dashboard/*` |
| Configurable E/S/G weighting (default 40/30/30) | `ESGConfig` model, editable in the **Settings** page |
| Reward Redemption (stock + points deduction) | `POST /api/gamification/rewards/redeem` |
| Notification System (compliance issues, approvals, policy reminders, badge unlocks) | `Notification` model + `services/notification_service.py`, bell icon in the UI, all four triggers gated by toggles in Settings |
| Auto Emission Calculation toggle | `ESGConfig.auto_emission_calculation`, enforced in `POST /api/environmental/carbon-transactions/auto-calculate` |
| Evidence Requirement toggle | Enforced in `POST /api/social/participations/{id}/decision` and the Challenge decision endpoint |
| Badge Auto-Award toggle | `services/badge_service.py`, runs automatically after every CSR/Challenge approval |
| Compliance Issue Ownership + overdue flagging | `ComplianceIssue.is_overdue` computed property + `GET /api/governance/compliance-issues/overdue` |
| 4 standard reports + Custom Report Builder (filter by Department/Date/Module/Employee/Challenge, export PDF/Excel/CSV) | `GET /api/reports/custom` (JSON or CSV export today — see note below), **Reports** page in the UI |
| Challenge lifecycle (Draft → Active → Under Review → Completed / Archived) | `Challenge.status` + guarded transitions in `gamification.py` |
| Leaderboards (department + org-wide) | `GET /api/gamification/leaderboard` |
| Mobile-responsive interface | Basic responsive CSS breakpoints in `frontend/src/styles.css` |

**Note on report exports:** the Custom Report Builder currently supports JSON (for on-screen viewing) and CSV export out of the box. `reportlab`/`openpyxl` are already included in `requirements.txt` so PDF/XLSX export can be added quickly to `backend/app/routers/dashboard.py` if you need those exact formats.

---

## 5. Notes & Next Steps

- **Authentication:** not included in this build — the UI simulates a "current user" via a dropdown (top-right) instead of login, so you can exercise approval workflows, participation, and reward redemption end-to-end. Add JWT/OAuth2 (FastAPI has first-class support) before any real deployment.
- **Scoring formulas** (`scoring_service.py`) are a reasonable, fully-documented starting point (goal progress for Environmental; participation rate + coverage for Social; policy acknowledgement + compliance health for Governance) — the spec calls these "configurable," so tune the formulas to your organization's actual KPIs.
- **File uploads** (proof of CSR/Challenge completion, policy documents) currently take a URL string rather than a binary upload — wire up S3/local disk storage behind those fields when ready.
- Run `POST /api/dashboard/recalculate` (or click **"Recalculate Scores"** on the Overview page) any time after adding data — this is meant to run nightly via a scheduler (cron/Celery beat) in production, mirroring the spec's `ir.cron`-style nightly job.
