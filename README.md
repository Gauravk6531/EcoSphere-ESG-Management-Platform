# EcoSphere – ESG Management Platform

EcoSphere is a full-stack MERN web application designed to help organizations monitor, manage, and improve their Environmental, Social, and Governance (ESG) performance.

This repository is pre-configured with a modular structure designed for collaborative development, allowing developers to work on separate modules (Environmental, Social, Governance, Gamification) in parallel without code conflicts.

---

## Project Structure

```text
ecosphere-esg-platform/
│
├── client/                 # React.js + Vite Frontend
│   ├── public/             # Static public assets
│   └── src/                # Frontend source code
│       ├── assets/         # Images, fonts, icons
│       ├── components/     # Reusable components
│       │   ├── common/     # Generic buttons, inputs, loaders
│       │   ├── layout/     # Header, Sidebar, Footer components
│       │   ├── forms/      # Input forms, validation handlers
│       │   ├── cards/      # Info cards, KPIs, metric indicators
│       │   ├── tables/     # Data tables, lists
│       │   └── charts/     # Recharts containers, visualizer elements
│       ├── layouts/        # Shared layouts (DashboardLayout, AuthLayout)
│       ├── pages/          # Feature entry points (auth, dashboard)
│       ├── routes/         # Router configuration
│       ├── services/       # API call handlers (Axios clients)
│       ├── context/        # React Context states (Auth, Theme)
│       ├── hooks/          # Custom hooks (useAuth, useFetch)
│       ├── utils/          # Helpers, formatters, constants
│       ├── App.jsx         # App root component (Routing structure)
│       └── main.jsx        # App entry script (DOM render & ThemeProvider)
│
├── server/                 # Node.js + Express.js Backend
│   ├── config/             # DB connection, configuration keys
│   ├── middleware/         # Auth guards, error handlers, upload helpers
│   ├── controllers/        # Express handlers (Logic flow controllers)
│   ├── models/             # Mongoose database schemas
│   ├── routes/             # API Router endpoints
│   ├── services/           # DB queries, business services
│   ├── utils/              # Helper utilities (jwt, mailers, loggers)
│   ├── validators/         # Input validate rules (Joi/Zod structure)
│   ├── uploads/            # Temporary file upload directory (ignored by git)
│   ├── app.js              # Express app definition & base middleware
│   └── server.js           # Server listen port & DB connection initializer
│
├── docs/                   # Documentation resources and API schemas
├── .github/                # GitHub templates and workflows
├── README.md               # Main instructions and setup manual
└── .gitignore              # Main ignore file
```

---

## Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Material UI, Recharts, Axios, React Router DOM.
- **Backend**: Node.js, Express.js, MongoDB Atlas (via Mongoose), JSON Web Tokens (JWT), Bcrypt, Multer.
- **Development Tooling**: ESLint, Prettier, Nodemon, Concurrently.

---

## Setup and Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) and [npm](https://www.npmjs.com/) installed.

### Steps
1. **Clone the repository** (if not already cloned).
2. **Navigate to the workspace**:
   ```bash
   cd ecosphere-esg-platform
   ```
3. **Install all dependencies** (installs root, client, and server dependencies):
   ```bash
   npm install
   ```
4. **Configure environment variables**:
   - Go to `server/` directory.
   - Copy `.env.example` to `.env`.
   - Update the values with your local/Atlas MongoDB URI and preferred JWT secret.
     ```bash
     cp server/.env.example server/.env
     ```

---

## Running the Application

### Development Mode
To run both the frontend (Vite) and the backend (Express) concurrently in development mode:
```bash
npm run dev
```

- **Frontend client**: Runs at `http://localhost:5173` (by default).
- **Backend server**: Runs at `http://localhost:5000` (by default).

### Individual Runners
If you want to run them in separate terminals:
- **Backend only**:
  ```bash
  cd server
  npm run dev
  ```
- **Frontend only**:
  ```bash
  cd client
  npm run dev
  ```

---

## Collaboration Guidelines

- **Branches**: Each developer should work in their feature-specific branch (e.g., `feature/environmental`, `feature/social`, `feature/governance`).
- **Imports**: Always use relative paths for shared utilities/components.
- **Styling**: Use Tailwind utility classes or custom MUI components styled with system styling where appropriate. Avoid mixing inline styling or plain CSS unless necessary.
- **Commit Messages**: Follow standard commit message guidelines (e.g., `feat(auth): add JWT middleware`).
