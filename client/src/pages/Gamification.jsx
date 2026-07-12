import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  getChallenges, createChallenge, updateChallengeStatus, deleteChallenge,
  getChallengeParticipations, createChallengeParticipation, decideChallengeParticipation,
  getBadges, createBadge, getEmployeeBadges,
  getRewards, createReward, redeemReward,
  getLeaderboard, getCategories,
} from "../services";
import { ErrorBanner, Empty, Pill } from "../components/common/Common.jsx";

const TABS = ["Challenges", "Badges", "Rewards", "Leaderboard"];
const STATUS_FLOW = { draft: ["active", "archived"], active: ["under_review", "archived"], under_review: ["completed", "active", "archived"], completed: ["archived"], archived: [] };

export default function Gamification() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={"tab-btn" + (tab === t ? " active" : "")} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {tab === "Challenges" && <Challenges />}
      {tab === "Badges" && <Badges />}
      {tab === "Rewards" && <Rewards />}
      {tab === "Leaderboard" && <Leaderboard />}
    </div>
  );
}

function Challenges() {
  const { employees, currentEmployeeId } = useApp();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", category_id: "", description: "", xp: 50, difficulty: "easy", evidence_required: false, deadline: "" });

  const load = () => {
    getChallenges().then(setItems).catch((e) => setError(e.message));
    getChallengeParticipations().then(setParticipations);
  };
  useEffect(() => { load(); getCategories().then((c) => setCategories(c.filter((x) => x.type === "challenge"))); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createChallenge({ ...form, category_id: form.category_id || null, xp: Number(form.xp), deadline: form.deadline || null });
      setForm({ title: "", category_id: "", description: "", xp: 50, difficulty: "easy", evidence_required: false, deadline: "" });
      load();
    } catch (err) { setError(err.message); }
  };

  const changeStatus = async (id, status) => {
    setError("");
    try { await updateChallengeStatus(id, status); load(); } catch (err) { setError(err.message); }
  };

  const join = async (challengeId) => {
    setError("");
    try {
      await createChallengeParticipation({ challenge_id: challengeId, employee_id: currentEmployeeId });
      load();
    } catch (err) { setError(err.message); }
  };

  const decide = async (id, approve) => {
    setError("");
    try { await decideChallengeParticipation(id, { approve }); load(); } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="card">
        <div className="section-title">Create Challenge</div>
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
          <div><label>XP Reward</label><input type="number" value={form.xp} onChange={(e) => setForm({ ...form, xp: e.target.value })} /></div>
          <div>
            <label>Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
          <div><label>Deadline</label><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></div>
          <div>
            <label>Evidence Required?</label>
            <select value={form.evidence_required} onChange={(e) => setForm({ ...form, evidence_required: e.target.value === "true" })}>
              <option value="false">No</option><option value="true">Yes</option>
            </select>
          </div>
          <div style={{ alignSelf: "end" }}><button type="submit">Create</button></div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Challenges (Draft → Active → Under Review → Completed / Archived)</div>
        {items.length === 0 ? <Empty /> : (
          <table>
            <thead><tr><th>Title</th><th>XP</th><th>Difficulty</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td><td>{c.xp}</td><td>{c.difficulty}</td>
                  <td><Pill value={c.status} /></td>
                  <td>
                    {c.status === "active" && <button className="small" onClick={() => join(c.id)}>Join (as current user)</button>}{" "}
                    {STATUS_FLOW[c.status]?.map((next) => (
                      <button key={next} className="small secondary" onClick={() => changeStatus(c.id, next)}>→ {next}</button>
                    ))}
                    {" "}
                    <button className="small danger" onClick={() => deleteChallenge(c.id).then(load)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="section-title">Challenge Submissions</div>
        {participations.length === 0 ? <Empty /> : (
          <table>
            <thead><tr><th>Challenge</th><th>Employee</th><th>Status</th><th>XP Awarded</th><th>Actions</th></tr></thead>
            <tbody>
              {participations.map((p) => (
                <tr key={p.id}>
                  <td>{items.find((c) => c.id === p.challenge_id)?.title || p.challenge_id}</td>
                  <td>{employees.find((e) => e.id === p.employee_id)?.name || p.employee_id}</td>
                  <td><Pill value={p.approval_status} /></td>
                  <td>{p.xp_awarded}</td>
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
    </div>
  );
}

function Badges() {
  const { currentEmployeeId } = useApp();
  const [items, setItems] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", unlock_metric: "xp_total", unlock_comparator: ">=", unlock_threshold: 100 });

  const load = () => {
    getBadges().then(setItems).catch((e) => setError(e.message));
    if (currentEmployeeId) getEmployeeBadges(currentEmployeeId).then(setMyBadges);
  };
  useEffect(load, [currentEmployeeId]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createBadge({ ...form, unlock_threshold: Number(form.unlock_threshold) });
      setForm({ name: "", description: "", unlock_metric: "xp_total", unlock_comparator: ">=", unlock_threshold: 100 });
      load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="card">
        <div className="section-title">Create Badge</div>
        <ErrorBanner message={error} />
        <form onSubmit={submit} className="form-row">
          <div><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div>
            <label>Unlock Metric</label>
            <select value={form.unlock_metric} onChange={(e) => setForm({ ...form, unlock_metric: e.target.value })}>
              <option value="xp_total">Total XP</option>
              <option value="completed_challenges">Completed Challenges</option>
              <option value="csr_participations">CSR Participations</option>
            </select>
          </div>
          <div>
            <label>Comparator</label>
            <select value={form.unlock_comparator} onChange={(e) => setForm({ ...form, unlock_comparator: e.target.value })}>
              <option value=">=">&gt;=</option><option value=">">&gt;</option><option value="==">=</option>
            </select>
          </div>
          <div><label>Threshold</label><input type="number" value={form.unlock_threshold} onChange={(e) => setForm({ ...form, unlock_threshold: e.target.value })} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ alignSelf: "end" }}><button type="submit">Create Badge</button></div>
        </form>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">All Badges (auto-awarded on unlock)</div>
          {items.length === 0 ? <Empty /> : (
            <table>
              <thead><tr><th>Name</th><th>Rule</th></tr></thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id}><td>{b.name}</td><td>{b.unlock_metric} {b.unlock_comparator} {b.unlock_threshold}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <div className="section-title">My Badges (current user)</div>
          {myBadges.length === 0 ? <Empty text="No badges unlocked yet." /> : (
            <ul>{myBadges.map((b) => <li key={b.id}>Badge #{b.badge_id} — {new Date(b.awarded_date).toLocaleDateString()}</li>)}</ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Rewards() {
  const { currentEmployeeId, currentEmployee, refresh } = useApp();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", description: "", points_required: 50, stock: 10 });

  const load = () => getRewards().then(setItems).catch((e) => setError(e.message));
  useEffect(load, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createReward({ ...form, points_required: Number(form.points_required), stock: Number(form.stock) });
      setForm({ name: "", description: "", points_required: 50, stock: 10 });
      load();
    } catch (err) { setError(err.message); }
  };

  const redeem = async (rewardId) => {
    setError("");
    try {
      await redeemReward({ employee_id: currentEmployeeId, reward_id: rewardId });
      load();
      refresh();
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      <div className="card">
        <div className="section-title">Create Reward</div>
        <ErrorBanner message={error} />
        <form onSubmit={submit} className="form-row">
          <div><label>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label>Points Required</label><input type="number" value={form.points_required} onChange={(e) => setForm({ ...form, points_required: e.target.value })} /></div>
          <div><label>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label>Description</label><input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div style={{ alignSelf: "end" }}><button type="submit">Add Reward</button></div>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Reward Catalog — your balance: {currentEmployee?.points_balance ?? 0} pts</div>
        {items.length === 0 ? <Empty /> : (
          <table>
            <thead><tr><th>Reward</th><th>Points</th><th>Stock</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td><td>{r.points_required}</td><td>{r.stock}</td><td><Pill value={r.status} /></td>
                  <td><button className="small" onClick={() => redeem(r.id)} disabled={r.stock <= 0}>Redeem</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Leaderboard() {
  const { departments } = useApp();
  const [deptId, setDeptId] = useState("");
  const [rows, setRows] = useState([]);

  useEffect(() => { getLeaderboard(deptId || undefined).then(setRows); }, [deptId]);

  return (
    <div className="card">
      <div className="section-title">Leaderboard</div>
      <div className="form-row">
        <div>
          <label>Department</label>
          <select value={deptId} onChange={(e) => setDeptId(e.target.value)}>
            <option value="">Organization-wide</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>
      {rows.length === 0 ? <Empty /> : (
        <table>
          <thead><tr><th>Rank</th><th>Employee</th><th>XP</th><th>Points</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.employee_id}><td>#{r.rank}</td><td>{r.name}</td><td>{r.xp_total}</td><td>{r.points_balance}</td></tr>)}</tbody>
        </table>
      )}
    </div>
  );
}
