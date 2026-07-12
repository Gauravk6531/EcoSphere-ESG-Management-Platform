import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getDepartments,
  getCategories,
  getSocialDashboard,
  getActivities,
  createActivity,
  deleteActivity,
  getParticipations,
  createParticipation,
  decideParticipation,
  getDiversityMetrics,
  getTrainingCompletions,
  createTrainingCompletion,
  updateTrainingCompletion,
  deleteTrainingCompletion,
} from '../../services/index.js';
import { Activity, UserCheck, Users, Award } from 'lucide-react';

const TABS = [
  { key: 'dashboard', label: 'Social Dashboard' },
  { key: 'activities', label: 'CSR Activities' },
  { key: 'participation', label: 'Participation' },
  { key: 'diversity', label: 'Diversity Metrics' },
  { key: 'training', label: 'Training Completion' },
];

const Social = () => {
  const { user, isManager, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [training, setTraining] = useState([]);
  const [diversity, setDiversity] = useState(null);
  const [error, setError] = useState('');
  const [activityForm, setActivityForm] = useState({ title: '', category_id: '', department_id: '', date: '', description: '', evidence_required: false });
  const [participationForm, setParticipationForm] = useState({ activity_id: '', proof_url: '' });
  const [trainingForm, setTrainingForm] = useState({ training_name: '', provider: '', due_date: '', status: 'assigned', score: '', certificate_url: '' });

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
    getCategories('csr_activity').then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      getSocialDashboard().then(setDashboard).catch((err) => setError(err.message || 'Unable to load dashboard'));
    }
    if (activeTab === 'activities') {
      getActivities().then(setActivities).catch((err) => setError(err.message || 'Unable to load activities'));
    }
    if (activeTab === 'participation') {
      getParticipations().then(setParticipations).catch((err) => setError(err.message || 'Unable to load participation'));
    }
    if (activeTab === 'diversity') {
      getDiversityMetrics().then(setDiversity).catch((err) => setError(err.message || 'Unable to load diversity metrics'));
    }
    if (activeTab === 'training') {
      getTrainingCompletions().then(setTraining).catch((err) => setError(err.message || 'Unable to load training records'));
    }
  }, [activeTab]);

  const handleActivitySubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createActivity({
        ...activityForm,
        department_id: activityForm.department_id || null,
        category_id: activityForm.category_id || null,
        date: activityForm.date || null,
      });
      setActivityForm({ title: '', category_id: '', department_id: '', date: '', description: '', evidence_required: false });
      setActivities(await getActivities());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create activity');
    }
  };

  const handleParticipationSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createParticipation({
        employee_id: user._id,
        activity_id: participationForm.activity_id,
        proof_url: participationForm.proof_url || null,
      });
      setParticipationForm({ activity_id: '', proof_url: '' });
      setParticipations(await getParticipations());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to submit participation');
    }
  };

  const handleParticipationDecision = async (id, approve) => {
    setError('');
    try {
      await decideParticipation(id, { approve });
      setParticipations(await getParticipations());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update participation');
    }
  };

  const handleTrainingSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createTrainingCompletion({
        employee_id: user._id,
        training_name: trainingForm.training_name,
        provider: trainingForm.provider,
        due_date: trainingForm.due_date || null,
        completion_date: trainingForm.completion_date || null,
        status: trainingForm.status,
        score: trainingForm.score === '' ? null : Number(trainingForm.score),
        certificate_url: trainingForm.certificate_url,
      });
      setTrainingForm({ training_name: '', provider: '', due_date: '', status: 'assigned', score: '', certificate_url: '' });
      setTraining(await getTrainingCompletions());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create training record');
    }
  };

  const handleTrainingUpdate = async (item) => {
    setError('');
    try {
      await updateTrainingCompletion(item._id, { ...item, status: 'completed', completion_date: item.completion_date || new Date().toISOString() });
      setTraining(await getTrainingCompletions());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update training record');
    }
  };

  const metrics = useMemo(() => [
    { label: 'CSR Activities', value: dashboard?.total_csr_activities ?? 0, icon: Activity },
    { label: 'Approved Participations', value: dashboard?.approved_participations ?? 0, icon: UserCheck },
    { label: 'Pending Reviews', value: dashboard?.pending_participations ?? 0, icon: Users },
    { label: 'Training Rate', value: `${dashboard?.training_completion_rate ?? 0}%`, icon: Award },
  ], [dashboard]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Social & CSR</h1>
          <p className="text-slate-500">Track CSR activities, participation, training and diversity progress.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setError(''); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${activeTab === tab.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">{error}</div>}

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center"><Icon size={22} /></div>
                    <div>
                      <p className="text-sm text-slate-500">{metric.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Participation Status</h2>
                {!dashboard?.participation_status_counts ? (
                  <p className="text-sm text-slate-500">No participation data available.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(dashboard.participation_status_counts).map(([status, count]) => (
                      <div key={status} className="flex justify-between gap-4 text-sm text-slate-700">
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900 mb-4">Department Breakdown</h2>
                {!dashboard?.department_breakdown?.length ? (
                  <p className="text-sm text-slate-500">No department data available.</p>
                ) : (
                  <div className="space-y-3">
                    {dashboard.department_breakdown.map((row) => (
                      <div key={row.department_id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex justify-between text-sm text-slate-700"><span>{row.department_name}</span><span>{row.csr_participations} CSR records</span></div>
                        <div className="mt-2 text-xs text-slate-500">Points: {row.points_earned}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Create CSR Activity</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleActivitySubmit}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Title
                    <input type="text" value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Date
                    <input type="date" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Department
                    <select value={activityForm.department_id} onChange={(e) => setActivityForm({ ...activityForm, department_id: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="">All departments</option>
                      {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Category
                    <select value={activityForm.category_id} onChange={(e) => setActivityForm({ ...activityForm, category_id: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="">Select category</option>
                      {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                    Description
                    <textarea value={activityForm.description} onChange={(e) => setActivityForm({ ...activityForm, description: e.target.value })} rows={3} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="flex items-center gap-3 text-sm text-slate-700">
                    <input type="checkbox" checked={activityForm.evidence_required} onChange={(e) => setActivityForm({ ...activityForm, evidence_required: e.target.checked })} className="rounded border-slate-300 text-emerald-600" />
                    Evidence required
                  </label>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Create activity</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">You need Manager or Admin access to create activities.</div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">CSR Activities</h2>
              {!activities.length ? (
                <p className="text-sm text-slate-500">No activities are defined yet.</p>
              ) : (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{activity.title}</p>
                        <p className="text-sm text-slate-500">{activity.description || 'No description provided.'}</p>
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-2">
                          <span>{new Date(activity.date).toLocaleDateString()}</span>
                          <span>{activity.department?.name || 'All Dept'}</span>
                          <span>{activity.category?.name || 'Uncategorized'}</span>
                        </div>
                      </div>
                      {(isManager() || isAdmin()) && (
                        <button onClick={async () => { await deleteActivity(activity._id); setActivities(await getActivities()); }} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'participation' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Submit Participation</h2>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleParticipationSubmit}>
                <label className="space-y-2 text-sm text-slate-700">
                  Activity
                  <select value={participationForm.activity_id} onChange={(e) => setParticipationForm({ ...participationForm, activity_id: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="">Select activity</option>
                    {activities.map((activity) => <option key={activity._id} value={activity._id}>{activity.title}</option>)}
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Proof URL
                  <input type="url" value={participationForm.proof_url} onChange={(e) => setParticipationForm({ ...participationForm, proof_url: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                </label>
                <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Submit participation</button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Participation Records</h2>
              {!participations.length ? (
                <p className="text-sm text-slate-500">No participation records found.</p>
              ) : (
                <div className="space-y-3">
                  {participations.map((item) => (
                    <div key={item._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.activity_id?.title || 'Unknown activity'}</p>
                        <p className="text-sm text-slate-500">{item.employee_id?.name || 'Unknown employee'}</p>
                        <p className="mt-2 text-xs text-slate-500">Status: {item.approval_status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.approval_status === 'submitted' && (isManager() || isAdmin()) && (
                          <>
                            <button onClick={() => handleParticipationDecision(item._id, true)} className="rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Approve</button>
                            <button onClick={() => handleParticipationDecision(item._id, false)} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'diversity' && (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_0.55fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Diversity Snapshot</h2>
              {!diversity ? (
                <p className="text-sm text-slate-500">No data available.</p>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Total employees</p>
                    <p className="text-2xl font-bold text-slate-900">{diversity.total_employees}</p>
                  </div>
                  <p className="text-sm text-slate-500">The platform supports demographics in the future to enrich this metric further.</p>
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-semibold text-slate-900 mb-3">Departments</h3>
              <div className="space-y-3">
                {departments.map((dept) => (
                  <div key={dept._id} className="rounded-2xl bg-white p-4 border border-slate-200">
                    <p className="font-semibold text-slate-900">{dept.name}</p>
                    <p className="text-sm text-slate-500">{dept.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'training' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Add Training Record</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleTrainingSubmit}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Training name
                    <input type="text" value={trainingForm.training_name} onChange={(e) => setTrainingForm({ ...trainingForm, training_name: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Provider
                    <input type="text" value={trainingForm.provider} onChange={(e) => setTrainingForm({ ...trainingForm, provider: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Due date
                    <input type="date" value={trainingForm.due_date} onChange={(e) => setTrainingForm({ ...trainingForm, due_date: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Status
                    <select value={trainingForm.status} onChange={(e) => setTrainingForm({ ...trainingForm, status: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Score
                    <input type="number" value={trainingForm.score} onChange={(e) => setTrainingForm({ ...trainingForm, score: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700 md:col-span-2">
                    Certificate URL
                    <input type="url" value={trainingForm.certificate_url} onChange={(e) => setTrainingForm({ ...trainingForm, certificate_url: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Add training</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Only Managers and Admins can add training records.</div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Training Records</h2>
              {!training.length ? (
                <p className="text-sm text-slate-500">No training history yet.</p>
              ) : (
                <div className="space-y-3">
                  {training.map((item) => (
                    <div key={item._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.training_name}</p>
                        <p className="text-sm text-slate-500">{item.provider || 'Provider not specified'}</p>
                        <p className="mt-2 text-xs text-slate-500">Status: {item.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.status !== 'completed' && (isManager() || isAdmin()) && (
                          <button onClick={() => handleTrainingUpdate(item)} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Mark completed</button>
                        )}
                        <button onClick={async () => { await deleteTrainingCompletion(item._id); setTraining(await getTrainingCompletions()); }} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
