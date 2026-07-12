import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  getEmissionFactors, createEmissionFactor, deleteEmissionFactor,
  getCarbonTransactions, createCarbonTransaction,
  getGoals, createGoal, deleteGoal,
  getProductProfiles, createProductProfile,
} from "../services";
import { ErrorBanner, Empty } from "../components/common/Common.jsx";

const TABS = ["Emission Factors", "Carbon Transactions", "Sustainability Goals", "Product Profiles"];

export default function Environmental() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === "Emission Factors" && <EmissionFactors />}
      {tab === "Carbon Transactions" && <CarbonTransactions />}
      {tab === "Sustainability Goals" && <Goals />}
      {tab === "Product Profiles" && <ProductProfiles />}
    </div>
  );
}

function EmissionFactors() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", category: "", co2e_value: "", unit: "kg", source: "" });

  const load = () => getEmissionFactors().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createEmissionFactor({ ...form, co2e_value: parseFloat(form.co2e_value) });
      setForm({ name: "", category: "", co2e_value: "", unit: "kg", source: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Emission Factors</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        <div><label>CO2e Value</label><input required type="number" step="0.001" value={form.co2e_value} onChange={(e) => setForm({ ...form, co2e_value: e.target.value })} /></div>
        <div><label>Unit</label><input required value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
        <div><label>Source</label><input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Factor</button></div>
      </form>

      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Name</th><th>Category</th><th>CO2e</th><th>Unit</th><th>Source</th><th></th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.name}</td><td>{i.category}</td><td>{i.co2e_value}</td><td>{i.unit}</td><td>{i.source}</td>
                <td><button className="small danger" onClick={() => deleteEmissionFactor(i.id).then(load)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CarbonTransactions() {
  const { departments } = useApp();
  const [items, setItems] = useState([]);
  const [factors, setFactors] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    source_document_type: "purchase", source_document_ref: "", emission_factor_id: "", quantity: "", department_id: "",
  });

  const load = () => getCarbonTransactions().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); getEmissionFactors().then(setFactors); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createCarbonTransaction({
        ...form,
        emission_factor_id: form.emission_factor_id,
        department_id: form.department_id,
        quantity: parseFloat(form.quantity),
      });
      setForm({ ...form, source_document_ref: "", quantity: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Carbon Transactions</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div>
          <label>Source</label>
          <select value={form.source_document_type} onChange={(e) => setForm({ ...form, source_document_type: e.target.value })}>
            <option value="purchase">Purchase</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="expense">Expense</option>
            <option value="fleet">Fleet</option>
          </select>
        </div>
        <div><label>Reference</label><input value={form.source_document_ref} onChange={(e) => setForm({ ...form, source_document_ref: e.target.value })} /></div>
        <div>
          <label>Emission Factor</label>
          <select required value={form.emission_factor_id} onChange={(e) => setForm({ ...form, emission_factor_id: e.target.value })}>
            <option value="">Select…</option>
            {factors.map((f) => <option key={f.id} value={f.id}>{f.name} ({f.unit})</option>)}
          </select>
        </div>
        <div><label>Quantity</label><input required type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
        <div>
          <label>Department</label>
          <select required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Select…</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: "end" }}><button type="submit">Log Transaction</button></div>
      </form>

      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Date</th><th>Source</th><th>Ref</th><th>Qty</th><th>CO2e</th><th>Dept</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>{i.date}</td><td>{i.source_document_type}</td><td>{i.source_document_ref}</td>
                <td>{i.quantity}</td><td><b>{i.co2e_calculated}</b></td>
                <td>{departments.find((d) => d.id === i.department_id)?.name || i.department_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Goals() {
  const { departments } = useApp();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ target_metric: "", target_value: "", current_value: 0, deadline: "", department_id: "" });

  const load = () => getGoals().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createGoal({
        ...form,
        target_value: parseFloat(form.target_value),
        current_value: parseFloat(form.current_value || 0),
        department_id: form.department_id,
        deadline: form.deadline || null,
      });
      setForm({ target_metric: "", target_value: "", current_value: 0, deadline: "", department_id: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Sustainability Goals</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div><label>Target Metric</label><input required value={form.target_metric} onChange={(e) => setForm({ ...form, target_metric: e.target.value })} /></div>
        <div><label>Target Value</label><input required type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} /></div>
        <div><label>Current Value</label><input type="number" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: e.target.value })} /></div>
        <div><label>Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
        <div>
          <label>Department</label>
          <select required value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Select…</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Goal</button></div>
      </form>

      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Metric</th><th>Progress</th><th>Target</th><th>Current</th><th>Deadline</th><th>Dept</th><th></th></tr></thead>
          <tbody>
            {items.map((g) => (
              <tr key={g.id}>
                <td>{g.target_metric}</td>
                <td>{g.progress}%</td>
                <td>{g.target_value}</td>
                <td>{g.current_value}</td>
                <td>{g.deadline}</td>
                <td>{departments.find((d) => d.id === g.department_id)?.name}</td>
                <td><button className="small danger" onClick={() => deleteGoal(g.id).then(load)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ProductProfiles() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ product_name: "", carbon_footprint: "", sustainability_rating: "" });

  const load = () => getProductProfiles().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createProductProfile({ ...form, carbon_footprint: parseFloat(form.carbon_footprint || 0) });
      setForm({ product_name: "", carbon_footprint: "", sustainability_rating: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <div className="section-title">Product ESG Profiles</div>
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="form-row">
        <div><label>Product Name</label><input required value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} /></div>
        <div><label>Carbon Footprint</label><input type="number" value={form.carbon_footprint} onChange={(e) => setForm({ ...form, carbon_footprint: e.target.value })} /></div>
        <div><label>Rating</label><input placeholder="A / B / C" value={form.sustainability_rating} onChange={(e) => setForm({ ...form, sustainability_rating: e.target.value })} /></div>
        <div style={{ alignSelf: "end" }}><button type="submit">Add Profile</button></div>
      </form>
      {items.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Product</th><th>Carbon Footprint</th><th>Rating</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}><td>{p.product_name}</td><td>{p.carbon_footprint}</td><td>{p.sustainability_rating}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
