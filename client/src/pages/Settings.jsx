import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  getConfig, updateConfig,
  createDepartment, updateDepartment, deleteDepartment,
  createCategory, deleteCategory, getCategories,
} from "../services";
import { ErrorBanner } from "../components/common/Common.jsx";

export default function Settings() {
  const { departments, refresh } = useApp();
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [deptForm, setDeptForm] = useState({ name: "", code: "" });
  const [categories, setCategories] = useState([]);
  const [catForm, setCatForm] = useState({ name: "", type: "csr_activity" });

  const loadConfig = () => getConfig().then(setConfig).catch((e) => setError(e.message));
  const loadCategories = () => getCategories().then(setCategories);

  useEffect(() => { loadConfig(); loadCategories(); }, []);

  const saveConfig = async (patch) => {
    setError("");
    try {
      const updated = await updateConfig(patch);
      setConfig(updated);
    } catch (e) { setError(e.message); }
  };

  const addDepartment = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createDepartment({ ...deptForm });
      setDeptForm({ name: "", code: "" });
      refresh();
    } catch (err) { setError(err.message); }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createCategory(catForm);
      setCatForm({ name: "", type: "csr_activity" });
      loadCategories();
    } catch (err) { setError(err.message); }
  };

  if (!config) return <div className="empty-state">Loading settings…</div>;

  return (
    <div>
      <ErrorBanner message={error} />

      <div className="card">
        <div className="section-title">ESG Configuration & Business Rules</div>
        <div className="grid grid-2">
          <ToggleRow label="Auto Emission Calculation" checked={config.auto_emission_calculation}
            onChange={(v) => saveConfig({ auto_emission_calculation: v })} />
          <ToggleRow label="Evidence Required for CSR Approval" checked={config.evidence_required}
            onChange={(v) => saveConfig({ evidence_required: v })} />
          <ToggleRow label="Badge Auto-Award" checked={config.badge_auto_award}
            onChange={(v) => saveConfig({ badge_auto_award: v })} />
          <ToggleRow label="Notify: Compliance Issue Raised" checked={config.notify_compliance_issue}
            onChange={(v) => saveConfig({ notify_compliance_issue: v })} />
          <ToggleRow label="Notify: Approval Decisions" checked={config.notify_approval_decision}
            onChange={(v) => saveConfig({ notify_approval_decision: v })} />
          <ToggleRow label="Notify: Policy Reminders" checked={config.notify_policy_reminder}
            onChange={(v) => saveConfig({ notify_policy_reminder: v })} />
          <ToggleRow label="Notify: Badge Unlocks" checked={config.notify_badge_unlock}
            onChange={(v) => saveConfig({ notify_badge_unlock: v })} />
        </div>

        <div className="section-title" style={{ marginTop: 18 }}>ESG Score Weights (must total ~100%)</div>
        <div className="form-row">
          <div>
            <label>Environmental %</label>
            <input type="number" value={config.weight_environmental}
              onChange={(e) => setConfig({ ...config, weight_environmental: Number(e.target.value) })} />
          </div>
          <div>
            <label>Social %</label>
            <input type="number" value={config.weight_social}
              onChange={(e) => setConfig({ ...config, weight_social: Number(e.target.value) })} />
          </div>
          <div>
            <label>Governance %</label>
            <input type="number" value={config.weight_governance}
              onChange={(e) => setConfig({ ...config, weight_governance: Number(e.target.value) })} />
          </div>
          <div style={{ alignSelf: "end" }}>
            <button onClick={() => saveConfig({
              weight_environmental: config.weight_environmental,
              weight_social: config.weight_social,
              weight_governance: config.weight_governance,
            })}>Save Weights</button>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Departments</div>
          <form onSubmit={addDepartment} className="form-row">
            <div><label>Name</label><input required value={deptForm.name} onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })} /></div>
            <div><label>Code</label><input value={deptForm.code} onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })} /></div>
            <div style={{ alignSelf: "end" }}><button type="submit">Add</button></div>
          </form>
          <table>
            <thead><tr><th>Name</th><th>Code</th><th>Employees</th><th></th></tr></thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td><td>{d.code}</td><td>{d.employee_count}</td>
                  <td><button className="small danger" onClick={() => deleteDepartment(d.id).then(refresh)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="section-title">Categories</div>
          <form onSubmit={addCategory} className="form-row">
            <div><label>Name</label><input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div>
            <div>
              <label>Type</label>
              <select value={catForm.type} onChange={(e) => setCatForm({ ...catForm, type: e.target.value })}>
                <option value="csr_activity">CSR Activity</option>
                <option value="challenge">Challenge</option>
              </select>
            </div>
            <div style={{ alignSelf: "end" }}><button type="submit">Add</button></div>
          </form>
          <table>
            <thead><tr><th>Name</th><th>Type</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td><td>{c.type}</td>
                  <td><button className="small danger" onClick={() => deleteCategory(c.id).then(loadCategories)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 13.5 }}>{label}</span>
      <input type="checkbox" style={{ width: "auto" }} checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </div>
  );
}
