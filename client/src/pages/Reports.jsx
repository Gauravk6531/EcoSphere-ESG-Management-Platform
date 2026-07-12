import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getCustomReport, customReportCsvUrl, customReportXlsxUrl, customReportPdfUrl } from "../services";
import { ErrorBanner, Empty } from "../components/common/Common.jsx";

export default function Reports() {
  const { departments, employees } = useApp();
  const [filters, setFilters] = useState({
    module: "environmental", department_id: "", employee_id: "", challenge_id: "", date_from: "", date_to: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const buildParams = () => {
    const params = { module: filters.module };
    if (filters.department_id) params.department_id = filters.department_id;
    if (filters.employee_id) params.employee_id = filters.employee_id;
    if (filters.challenge_id) params.challenge_id = filters.challenge_id;
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    return params;
  };

  const run = async () => {
    setError("");
    try {
      const data = await getCustomReport(buildParams());
      setResult(data);
    } catch (e) { setError(e.message); }
  };

  const columns = result?.rows?.length ? Object.keys(result.rows[0]) : [];

  return (
    <div>
      <div className="card">
        <div className="section-title">Custom Report Builder</div>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Choose a module and filters, then run the report. Export to CSV for Excel/PDF workflows downstream.
        </p>
        <ErrorBanner message={error} />
        <div className="form-row">
          <div>
            <label>Module / Report Type</label>
            <select value={filters.module} onChange={(e) => setFilters({ ...filters, module: e.target.value })}>
              <option value="environmental">Environmental Report (Carbon Transactions)</option>
              <option value="social">Social Report (Employee Participation)</option>
              <option value="social_training">Social Report (Training Completion)</option>
              <option value="social_challenges">Social Report (Challenge Participation)</option>
              <option value="governance">Governance Report (Compliance Issues)</option>
              <option value="esg_summary">ESG Summary Report (Department Scores)</option>
            </select>
          </div>
          <div>
            <label>Department</label>
            <select value={filters.department_id} onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}>
              <option value="">All</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label>Employee</label>
            <select value={filters.employee_id} onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}>
              <option value="">All</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          {filters.module === "social_challenges" && (
            <div><label>Challenge ID</label><input value={filters.challenge_id} onChange={(e) => setFilters({ ...filters, challenge_id: e.target.value })} /></div>
          )}
          <div><label>Date From</label><input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })} /></div>
          <div><label>Date To</label><input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })} /></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={run}>Run Report</button>
          <a className="secondary" style={{ textDecoration: "none" }} href={customReportCsvUrl(buildParams())} target="_blank" rel="noreferrer">
            <button type="button" className="secondary">Export CSV</button>
          </a>
          <a className="secondary" style={{ textDecoration: "none" }} href={customReportXlsxUrl(buildParams())} target="_blank" rel="noreferrer">
            <button type="button" className="secondary">Export Excel</button>
          </a>
          <a className="secondary" style={{ textDecoration: "none" }} href={customReportPdfUrl(buildParams())} target="_blank" rel="noreferrer">
            <button type="button" className="secondary">Export PDF</button>
          </a>
        </div>
      </div>

      {result && (
        <div className="card">
          <div className="section-title">Results ({result.count})</div>
          {columns.length === 0 ? <Empty text="No matching records." /> : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>
                  {result.rows.map((row, idx) => (
                    <tr key={idx}>{columns.map((c) => <td key={c}>{String(row[c] ?? "")}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
