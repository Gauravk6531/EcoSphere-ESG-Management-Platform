import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useApp } from "../AppContext.jsx";
import {
  getActivities, createActivity, deleteActivity,
  getParticipations, createParticipation, decideParticipation,
  getCategories, getDiversityMetrics, getSocialDashboard,
  getTrainingCompletions, createTrainingCompletion, updateTrainingCompletion, deleteTrainingCompletion,
} from "../api";
import { ErrorBanner, Empty, Pill } from "../components/Common.jsx";

const TABS = ["Social Dashboard", "CSR Activities", "Employee Participation", "Diversity Metrics", "Training Completion"];

export default function Social() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Social Dashboard" && <SocialDashboard />}
      {tab === "CSR Activities" && <Activities />}
      {tab === "Employee Participation" && <Participation />}
      {tab === "Diversity Metrics" && <Diversity />}
      {tab === "Training Completion" && <TrainingCompletion />}
    </div>
  );
}

function SocialDashboard() {
  const { departments } = useApp();
  const [deptId, setDeptId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    getSocialDashboard(deptId || undefined).then(setData).catch((e) => setError(e.message));
  }, [deptId]);

  const statusRows = data
    ? Object.entries(data.participation_status_counts || {}).map(([status, count]) => ({ status, count }))
    : [];

  return (
    <div>
      <ErrorBanner message={error} />
      <div className="card">
        <div className="section-title">Social Dashboard</div>
        <div className="form-row">
          <div>
            <label>Department</label>
            <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card kpi"><div className="label">CSR Activities</div><div className="value">{data?.total_csr_activities ?? "-"}</div></div>
        <div className="card kpi"><div className="label">Approved CSR</div><div className="value">{data?.approved_participations ?? "-"}</div></div>
        <div className="card kpi"><div className="label">Pending Reviews</div><div className="value">{data?.pending_participations ?? "-"}</div></div>
        <div className="card kpi"><div className="label">Training Completion</div><div className="value">{data?.training_completion_rate ?? 0}%</div></div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Participation Status</div>
          {statusRows.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={statusRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2f6f8f" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="section-title">Department Social Activity</div>
          {!data?.department_breakdown?.length ? <Empty /> : (
            <table>
              <thead><tr><th>Department</th><th>Employees</th><th>CSR Records</th><th>Points</th></tr></thead>
              <tbody>
                {data.department_breakdown.map((d) => (
                  <tr key={d.department_id}>
                    <td>{d.department_name}</td><td>{d.employees}</td><td>{d.csr_participations}</td><td>{d.points_earned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Activities() {
  const { departments } = useApp();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", category_id: "", department_id: "", date: "", description: "", evidence_required: false,
  });

  const load = () => getActivities().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); getCategories().then((c) => setCategories(c.filter((x) => x.type === "csr_activity"))); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createActivity({
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        department_id: form.department_id ? Number(form.department_id) : null,
        date: form.date || null,
      });
      setForm({ title: "", category_id: "", department_id: "", date: "", description: "", evidence_required: false });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">CSR Activities</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div>
          <label>Category</label>
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label>Department</label>
          <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">None</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div>
          <label>Evidence Required?</label>
          <select value={form.evidence_required} onChange={(e) => setForm({ ...form, evidence_required: e.target.value === "true" })}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}><label>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Activity</button></div>
      </form>

      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Title</th><th>Date</th><th>Evidence?</th><th></th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td><td>{a.date}</td><td>{a.evidence_required ? "Yes" : "No"}</td>
                <td><button className="small danger" onClick={() => deleteActivity(a.id).then(load)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Participation() {
  const { employees, currentEmployeeId } = useApp();
  const [activities, setActivities] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ activity_id: "", proof_url: "" });

  const load = () => getParticipations().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); getActivities().then(setActivities); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createParticipation({
        employee_id: currentEmployeeId, activity_id: Number(form.activity_id), proof_url: form.proof_url || null,
      });
      setForm({ activity_id: "", proof_url: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  const decide = async (id, approve) => {
    setError("");
    try {
      await decideParticipation(id, { approve, points_earned: approve ? 25 : 0 });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Submit Participation (as current user)</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div>
          <label>Activity</label>
          <select required value={form.activity_id} onChange={(e) => setForm({ ...form, activity_id: e.target.value })}>
            <option value="">Select…</option>
            {activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div><label>Proof URL (optional)</label><input value={form.proof_url} onChange={(e) => setForm({ ...form, proof_url: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Submit</button></div>
      </form>

      <div className="section-title" style={{ marginTop: 18 }}>All Participation Records</div>
      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Employee</th><th>Activity</th><th>Status</th><th>Points</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{employees.find((e) => e.id === p.employee_id)?.name || p.employee_id}</td>
                <td>{activities.find((a) => a.id === p.activity_id)?.title || p.activity_id}</td>
                <td><Pill value={p.approval_status} /></td>
                <td>{p.points_earned}</td>
                <td>
                  {p.approval_status === "submitted" && (
                    <>
                      <button className="small" onClick={() => decide(p.id, true)}>Approve</button>{" "}
                      <button className="small danger" onClick={() => decide(p.id, false)}>Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Diversity() {
  const { departments } = useApp();
  const [deptId, setDeptId] = useState("");
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    getDiversityMetrics(deptId || undefined).then(setMetrics);
  }, [deptId]);

  return (
    <div className="card">
      <div className="section-title">Diversity Snapshot</div>
      <div className="form-row">
        <div>
          <label>Department</label>
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      {metrics ? (
        <div>
          <p>Total Employees: <b>{metrics.total_employees}</b></p>
          <p style={{ fontSize: 12, color: "var(--muted)" }}>{metrics.note}</p>
        </div>
      ) : <Empty />}
    </div>
  );
}

function TrainingCompletion() {
  const { employees } = useApp();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    employee_id: "", training_name: "", provider: "", due_date: "", completion_date: "", status: "assigned", score: "", certificate_url: "",
  });

  const load = () => getTrainingCompletions().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createTrainingCompletion({
        ...form,
        employee_id: Number(form.employee_id),
        due_date: form.due_date || null,
        completion_date: form.completion_date || null,
        score: form.score === "" ? null : Number(form.score),
      });
      setForm({ employee_id: "", training_name: "", provider: "", due_date: "", completion_date: "", status: "assigned", score: "", certificate_url: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  const markComplete = async (item) => {
    setError("");
    try {
      await updateTrainingCompletion(item.id, {
        employee_id: item.employee_id,
        training_name: item.training_name,
        provider: item.provider,
        due_date: item.due_date,
        completion_date: item.completion_date || new Date().toISOString().slice(0, 10),
        status: "completed",
        score: item.score,
        certificate_url: item.certificate_url,
      });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Training Completion</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div>
          <label>Employee</label>
          <select required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select...</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div><label>Training</label><input required value={form.training_name} onChange={(e) => setForm({ ...form, training_name: e.target.value })} /></div>
        <div><label>Provider</label><input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} /></div>
        <div><label>Due Date</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
        <div><label>Completion Date</label><input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} /></div>
        <div>
          <label>Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="assigned">Assigned</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="overdue">Overdue</option>
          </select>
        </div>
        <div><label>Score</label><input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
        <div><label>Certificate URL</label><input value={form.certificate_url} onChange={(e) => setForm({ ...form, certificate_url: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Training</button></div>
      </form>

      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Employee</th><th>Training</th><th>Due</th><th>Completed</th><th>Status</th><th>Score</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.id}>
                <td>{employees.find((e) => e.id === t.employee_id)?.name || t.employee_id}</td>
                <td>{t.training_name}</td><td>{t.due_date || "-"}</td><td>{t.completion_date || "-"}</td>
                <td><Pill value={t.status} /></td><td>{t.score ?? "-"}</td>
                <td>
                  {t.status !== "completed" && <button className="small" onClick={() => markComplete(t)}>Complete</button>}{" "}
                  <button className="small danger" onClick={() => deleteTrainingCompletion(t.id).then(load)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
