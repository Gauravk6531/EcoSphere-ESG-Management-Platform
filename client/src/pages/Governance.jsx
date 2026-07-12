import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  getPolicies, createPolicy, deletePolicy,
  getAcknowledgements, acknowledgePolicy, sendReminder,
  getAudits, createAudit, deleteAudit,
  getComplianceIssues, createComplianceIssue, updateComplianceIssue,
} from "../services";
import { ErrorBanner, Empty, Pill } from "../components/common/Common.jsx";

const TABS = ["Policies", "Acknowledgements", "Audits", "Compliance Issues"];

export default function Governance() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Policies" && <Policies />}
      {tab === "Acknowledgements" && <Acknowledgements />}
      {tab === "Audits" && <Audits />}
      {tab === "Compliance Issues" && <ComplianceIssues />}
    </div>
  );
}

function Policies() {
  const { departments } = useApp();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", document_url: "", version: "1.0", department_ids: [] });

  const load = () => getPolicies().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const toggleDept = (id) => {
    setForm((f) => ({
      ...f,
      department_ids: f.department_ids.includes(id) ? f.department_ids.filter((x) => x !== id) : [...f.department_ids, id],
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createPolicy(form);
      setForm({ name: "", document_url: "", version: "1.0", department_ids: [] });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">ESG Policies</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label>Document URL</label><input value={form.document_url} onChange={(e) => setForm({ ...form, document_url: e.target.value })} /></div>
        <div><label>Version</label><input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label>Applies to Departments</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {departments.map((d) => (
              <label key={d.id} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input type="checkbox" style={{ width: "auto" }} checked={form.department_ids.includes(d.id)} onChange={() => toggleDept(d.id)} />
                {d.name}
              </label>
            ))}
          </div>
        </div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Policy</button></div>
      </form>
      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Name</th><th>Version</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.version}</td><td><Pill value={p.status} /></td>
                <td><button className="small danger" onClick={() => deletePolicy(p.id).then(load)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Acknowledgements() {
  const { employees, currentEmployeeId } = useApp();
  const [policies, setPolicies] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState("");

  const load = () => getAcknowledgements().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); getPolicies().then(setPolicies); }, []);

  const ack = async () => {
    setError("");
    try {
      await acknowledgePolicy({ policy_id: selectedPolicy, employee_id: currentEmployeeId });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Policy Acknowledgements</div>
      <ErrorBanner message={error} />
      <div className="form-row">
        <div>
          <label>Policy</label>
          <select value={selectedPolicy} onChange={(e) => setSelectedPolicy(e.target.value)}>
            <option value="">Select…</option>
            {policies.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: "end" }}><button disabled={!selectedPolicy} onClick={ack}>Acknowledge as current user</button></div>
      </div>
      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Policy</th><th>Employee</th><th>Acknowledged</th><th>Reminder Sent</th><th></th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{policies.find((p) => p.id === a.policy_id)?.name || a.policy_id}</td>
                <td>{employees.find((e) => e.id === a.employee_id)?.name || a.employee_id}</td>
                <td>{a.acknowledged_date ? new Date(a.acknowledged_date).toLocaleDateString() : "Pending"}</td>
                <td>{a.reminder_sent ? "Yes" : "No"}</td>
                <td>
                  {!a.acknowledged_date && (
                    <button className="small secondary" onClick={() => sendReminder(a.id).then(load)}>Send Reminder</button>
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

function Audits() {
  const { departments } = useApp();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", auditor: "", department_id: "", date: "", findings_summary: "" });

  const load = () => getAudits().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createAudit({ ...form, department_id: form.department_id || null, date: form.date || null });
      setForm({ title: "", auditor: "", department_id: "", date: "", findings_summary: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Audits</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div><label>Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><label>Auditor</label><input value={form.auditor} onChange={(e) => setForm({ ...form, auditor: e.target.value })} /></div>
        <div>
          <label>Department</label>
          <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Select…</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div style={{ gridColumn: "1 / -1" }}><label>Findings Summary</label><textarea rows={2} value={form.findings_summary} onChange={(e) => setForm({ ...form, findings_summary: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Audit</button></div>
      </form>
      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Title</th><th>Auditor</th><th>Date</th><th></th></tr></thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.title}</td><td>{a.auditor}</td><td>{a.date}</td>
                <td><button className="small danger" onClick={() => deleteAudit(a.id).then(load)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ComplianceIssues() {
  const { employees } = useApp();
  const [items, setItems] = useState([]);
  const [audits, setAudits] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ audit_id: "", severity: "medium", description: "", owner_id: "", due_date: "" });

  const load = () => getComplianceIssues().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); getAudits().then(setAudits); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createComplianceIssue({
        ...form,
        audit_id: form.audit_id || null,
        owner_id: form.owner_id,
      });
      setForm({ audit_id: "", severity: "medium", description: "", owner_id: "", due_date: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  const setStatus = async (issue, status) => {
    setError("");
    try {
      await updateComplianceIssue(issue.id, { ...issue, status, audit_id: issue.audit_id, owner_id: issue.owner_id });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Compliance Issues</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div>
          <label>Audit (optional)</label>
          <select value={form.audit_id} onChange={(e) => setForm({ ...form, audit_id: e.target.value })}>
            <option value="">None</option>
            {audits.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <div>
          <label>Severity</label>
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            <option value="low">Low</option><option value="medium">Medium</option>
            <option value="high">High</option><option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label>Owner</label>
          <select required value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })}>
            <option value="">Select…</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div><label>Due Date</label><input required type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
        <div style={{ gridColumn: "1 / -1" }}><label>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Raise Issue</button></div>
      </form>

      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Description</th><th>Severity</th><th>Owner</th><th>Due Date</th><th>Status</th><th>Overdue?</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.description}</td>
                <td><Pill value={i.severity} /></td>
                <td>{employees.find((e) => e.id === i.owner_id)?.name || i.owner_id}</td>
                <td>{i.due_date}</td>
                <td><Pill value={i.status} /></td>
                <td>{i.is_overdue ? "⚠️ Yes" : "No"}</td>
                <td>
                  {i.status !== "resolved" && i.status !== "closed" && (
                    <button className="small" onClick={() => setStatus(i, "resolved")}>Mark Resolved</button>
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
