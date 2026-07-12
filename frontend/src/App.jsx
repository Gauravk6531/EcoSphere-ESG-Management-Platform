import { Routes, Route, NavLink } from "react-router-dom";
import { useApp } from "./AppContext.jsx";
import Overview from "./pages/Overview.jsx";
import Environmental from "./pages/Environmental.jsx";
import Social from "./pages/Social.jsx";
import Governance from "./pages/Governance.jsx";
import Gamification from "./pages/Gamification.jsx";
import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx";
import NotificationBell from "./components/NotificationBell.jsx";

const NAV_ITEMS = [
  { to: "/", label: "🌍 Overview", end: true },
  { to: "/environmental", label: "🌱 Environmental" },
  { to: "/social", label: "🤝 Social" },
  { to: "/governance", label: "⚖️ Governance" },
  { to: "/gamification", label: "🏆 Gamification" },
  { to: "/reports", label: "📊 Reports" },
  { to: "/settings", label: "⚙️ Settings" },
];

export default function App() {
  const { employees, currentEmployeeId, setCurrentEmployeeId, currentEmployee } = useApp();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>EcoSphere</h1>
        <p className="tagline">ESG Management Platform</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      <main className="main">
        <div className="topbar">
          <h2>ESG Command Center</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <NotificationBell employeeId={currentEmployeeId} />
            <select
              className="employee-select"
              value={currentEmployeeId || ""}
              onChange={(e) => setCurrentEmployeeId(Number(e.target.value))}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} {e.is_department_head ? "(Head)" : ""}
                </option>
              ))}
            </select>
            {currentEmployee && (
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                XP: <b>{currentEmployee.xp_total}</b> · Points: <b>{currentEmployee.points_balance}</b>
              </span>
            )}
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/environmental" element={<Environmental />} />
          <Route path="/social" element={<Social />} />
          <Route path="/governance" element={<Governance />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
