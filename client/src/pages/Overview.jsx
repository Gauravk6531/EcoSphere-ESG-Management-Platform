import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getDashboardOverview, recalculateScores, getLeaderboard } from "../services";
import { ErrorBanner, Empty } from "../components/common/Common.jsx";

export default function Overview() {
  const [data, setData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");
  const [recalculating, setRecalculating] = useState(false);

  const load = () => {
    setError("");
    Promise.all([getDashboardOverview(), getLeaderboard()])
      .then(([overview, board]) => {
        setData(overview);
        setLeaderboard(board);
      })
      .catch((e) => setError(e.message));
  };

  useEffect(load, []);

  const handleRecalculate = async () => {
    setRecalculating(true);
    setError("");
    try {
      await recalculateScores();
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setRecalculating(false);
    }
  };

  if (!data && !error) return <div className="empty-state">Loading dashboard…</div>;

  return (
    <div>
      <ErrorBanner message={error} />

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="label">Overall ESG Score</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: "var(--primary)" }}>
              {data?.overall_esg_score ?? "-"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Weighted average of department total scores (weights configurable in Settings)
            </div>
          </div>
          <button onClick={handleRecalculate} disabled={recalculating}>
            {recalculating ? "Recalculating…" : "Recalculate Scores"}
          </button>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi">
          <div className="label">Employees</div>
          <div className="value">{data?.total_employees ?? "-"}</div>
        </div>
        <div className="card kpi">
          <div className="label">Carbon Transactions</div>
          <div className="value">{data?.total_carbon_transactions ?? "-"}</div>
        </div>
        <div className="card kpi">
          <div className="label">Open Compliance Issues</div>
          <div className="value" style={{ color: "var(--gov)" }}>{data?.open_compliance_issues ?? "-"}</div>
        </div>
        <div className="card kpi">
          <div className="label">Overdue Compliance Issues</div>
          <div className="value" style={{ color: "var(--danger)" }}>{data?.overdue_compliance_issues ?? "-"}</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Department Scores (E / S / G)</div>
          {data && data.departments.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department_name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="environmental_score" fill="#2f8f5b" name="Environmental" />
                <Bar dataKey="social_score" fill="#2f6f8f" name="Social" />
                <Bar dataKey="governance_score" fill="#8f6b2f" name="Governance" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty text="No department scores yet — click Recalculate Scores above." />
          )}
        </div>

        <div className="card">
          <div className="section-title">🏆 Org-wide Leaderboard (Top by XP)</div>
          {leaderboard.length === 0 ? (
            <Empty text="No XP earned yet." />
          ) : (
            <table>
              <thead>
                <tr><th>Rank</th><th>Employee</th><th>XP</th><th>Points</th></tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.employee_id}>
                    <td>#{row.rank}</td>
                    <td>{row.name}</td>
                    <td>{row.xp_total}</td>
                    <td>{row.points_balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Department Totals</div>
        {data && data.departments.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Department</th><th>Environmental</th><th>Social</th><th>Governance</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.departments.map((d) => (
                <tr key={d.department_id}>
                  <td>{d.department_name}</td>
                  <td>{d.environmental_score ?? "-"}</td>
                  <td>{d.social_score ?? "-"}</td>
                  <td>{d.governance_score ?? "-"}</td>
                  <td><b>{d.total_score ?? "-"}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
}
