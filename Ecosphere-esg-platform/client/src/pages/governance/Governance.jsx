import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getDepartments,
  getPolicies,
  createPolicy,
  deletePolicy,
  getAcknowledgements,
  acknowledgePolicy,
  sendReminder,
  getAudits,
  createAudit,
  deleteAudit,
  getComplianceIssues,
  createComplianceIssue,
  updateComplianceIssue,
} from '../../services/index.js';

const TABS = [
  { key: 'policies', label: 'Policies' },
  { key: 'acknowledgements', label: 'Acknowledgements' },
  { key: 'audits', label: 'Audits' },
  { key: 'compliance', label: 'Compliance Issues' },
];

const Governance = () => {
  const { user, isManager, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('policies');
  const [departments, setDepartments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [audits, setAudits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [error, setError] = useState('');
  const [policyForm, setPolicyForm] = useState({ name: '', document_url: '', version: '1.0', department_ids: [] });
  const [ackForm, setAckForm] = useState({ policy_id: '' });
  const [auditForm, setAuditForm] = useState({ title: '', auditor: '', department_id: '', date: '', findings_summary: '' });
  const [issueForm, setIssueForm] = useState({ audit_id: '', severity: 'medium', description: '', owner_id: user?._id || '', due_date: '' });

  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'policies') getPolicies().then(setPolicies).catch((err) => setError(err.message || 'Unable to load policies'));
    if (activeTab === 'acknowledgements') getAcknowledgements().then(setAcknowledgements).catch((err) => setError(err.message || 'Unable to load acknowledgements'));
    if (activeTab === 'audits') getAudits().then(setAudits).catch((err) => setError(err.message || 'Unable to load audits'));
    if (activeTab === 'compliance') getComplianceIssues().then(setIssues).catch((err) => setError(err.message || 'Unable to load compliance issues'));
  }, [activeTab]);

  const refreshCurrent = () => {
    setError('');
    if (activeTab === 'policies') return getPolicies().then(setPolicies).catch(() => {});
    if (activeTab === 'acknowledgements') return getAcknowledgements().then(setAcknowledgements).catch(() => {});
    if (activeTab === 'audits') return getAudits().then(setAudits).catch(() => {});
    if (activeTab === 'compliance') return getComplianceIssues().then(setIssues).catch(() => {});
    return Promise.resolve();
  };

  const submitPolicy = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createPolicy(policyForm);
      setPolicyForm({ name: '', document_url: '', version: '1.0', department_ids: [] });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create policy');
    }
  };

  const submitAcknowledgement = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await acknowledgePolicy({ policy_id: ackForm.policy_id, employee_id: user._id });
      setAckForm({ policy_id: '' });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to acknowledge policy');
    }
  };

  const submitAudit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createAudit(auditForm);
      setAuditForm({ title: '', auditor: '', department_id: '', date: '', findings_summary: '' });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create audit');
    }
  };

  const submitIssue = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await createComplianceIssue({ ...issueForm, owner_id: user._id, audit_id: issueForm.audit_id || null });
      setIssueForm({ audit_id: '', severity: 'medium', description: '', owner_id: user._id, due_date: '' });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to create compliance issue');
    }
  };

  const updateIssueStatus = async (issue, status) => {
    setError('');
    try {
      await updateComplianceIssue(issue._id, { ...issue, status, audit_id: issue.audit_id?._id || issue.audit_id, owner_id: issue.owner_id?._id || issue.owner_id });
      await refreshCurrent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to update issue');
    }
  };

  const handleToggleDepartment = (id) => {
    setPolicyForm((prev) => ({
      ...prev,
      department_ids: prev.department_ids.includes(id) ? prev.department_ids.filter((entry) => entry !== id) : [...prev.department_ids, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Governance</h1>
          <p className="text-slate-500">Manage policies, audits, acknowledgements and compliance issues.</p>
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

        {activeTab === 'policies' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Publish ESG Policy</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={submitPolicy}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Policy name
                    <input type="text" value={policyForm.name} onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Document URL
                    <input type="url" value={policyForm.document_url} onChange={(e) => setPolicyForm({ ...policyForm, document_url: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Version
                    <input type="text" value={policyForm.version} onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <div className="md:col-span-2 rounded-3xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-semibold text-slate-900 mb-2">Departments</p>
                    <div className="flex flex-wrap gap-2">
                      {departments.map((dept) => (
                        <button type="button" key={dept._id} onClick={() => handleToggleDepartment(dept._id)} className={`rounded-full border px-3 py-2 text-sm ${policyForm.department_ids.includes(dept._id) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'}`}>
                          {dept.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Publish policy</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Only Admin or Manager roles can publish policies.</div>
            )}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">ESG Policies</h2>
              {!policies.length ? (
                <p className="text-sm text-slate-500">No policies available.</p>
              ) : (
                <div className="space-y-3">
                  {policies.map((policy) => (
                    <div key={policy._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{policy.name}</p>
                        <p className="text-sm text-slate-500">Version {policy.version} • Status {policy.status}</p>
                      </div>
                      {(isManager() || isAdmin()) && (
                        <button onClick={async () => { await deletePolicy(policy._id); await refreshCurrent(); }} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'acknowledgements' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Acknowledge Policy</h2>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={submitAcknowledgement}>
                <label className="space-y-2 text-sm text-slate-700">
                  Policy
                  <select value={ackForm.policy_id} onChange={(e) => setAckForm({ ...ackForm, policy_id: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="">Select policy</option>
                    {policies.map((policy) => <option key={policy._id} value={policy._id}>{policy.name}</option>)}
                  </select>
                </label>
                <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Acknowledge</button>
              </form>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Acknowledgements</h2>
              {!acknowledgements.length ? (
                <p className="text-sm text-slate-500">No acknowledgements recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {acknowledgements.map((ack) => (
                    <div key={ack._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <p className="font-semibold text-slate-900">{ack.policy_id?.name || 'Unknown policy'}</p>
                      <p className="text-sm text-slate-500">By {ack.employee_id?.name || 'Unknown user'} • {ack.acknowledged_date ? new Date(ack.acknowledged_date).toLocaleDateString() : 'Pending'}</p>
                      {isManager() || isAdmin() ? (
                        <button onClick={async () => { await sendReminder(ack._id); await refreshCurrent(); }} className="mt-3 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Send reminder</button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="space-y-6">
            {(isManager() || isAdmin()) ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900 mb-4">Log Audit</h2>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={submitAudit}>
                  <label className="space-y-2 text-sm text-slate-700">
                    Audit title
                    <input type="text" value={auditForm.title} onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Auditor
                    <input type="text" value={auditForm.auditor} onChange={(e) => setAuditForm({ ...auditForm, auditor: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Department
                    <select value={auditForm.department_id} onChange={(e) => setAuditForm({ ...auditForm, department_id: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                      <option value="">Select department</option>
                      {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                    </select>
                  </label>
                  <label className="space-y-2 text-sm text-slate-700">
                    Audit date
                    <input type="date" value={auditForm.date} onChange={(e) => setAuditForm({ ...auditForm, date: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
                    Findings summary
                    <textarea rows={3} value={auditForm.findings_summary} onChange={(e) => setAuditForm({ ...auditForm, findings_summary: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                  </label>
                  <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Save audit</button>
                </form>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-600">Only Admin or Manager roles can log audits.</div>
            )}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Audit History</h2>
              {!audits.length ? (
                <p className="text-sm text-slate-500">No audits recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {audits.map((audit) => (
                    <div key={audit._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{audit.title}</p>
                        <p className="text-sm text-slate-500">{audit.auditor} • {audit.department?.name || 'General'}</p>
                      </div>
                      {(isManager() || isAdmin()) && (
                        <button onClick={async () => { await deleteAudit(audit._id); await refreshCurrent(); }} className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">Delete</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-semibold text-slate-900 mb-4">Report Compliance Issue</h2>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={submitIssue}>
                <label className="space-y-2 text-sm text-slate-700">
                  Audit reference
                  <input type="text" value={issueForm.audit_id} onChange={(e) => setIssueForm({ ...issueForm, audit_id: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Severity
                  <select value={issueForm.severity} onChange={(e) => setIssueForm({ ...issueForm, severity: e.target.value })} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Due date
                  <input type="date" value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                </label>
                <label className="md:col-span-2 space-y-2 text-sm text-slate-700">
                  Description
                  <textarea rows={3} value={issueForm.description} onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })} required className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" />
                </label>
                <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Report issue</button>
              </form>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 mb-4">Open Compliance Issues</h2>
              {!issues.length ? (
                <p className="text-sm text-slate-500">No compliance issues reported yet.</p>
              ) : (
                <div className="space-y-3">
                  {issues.map((issue) => (
                    <div key={issue._id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{issue.description}</p>
                          <p className="text-sm text-slate-500">Severity: {issue.severity} • Owner: {issue.owner_id?.name || issue.owner_id || 'Unassigned'}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(isManager() || isAdmin()) && issue.status !== 'resolved' && issue.status !== 'closed' && (
                            <button onClick={() => updateIssueStatus(issue, 'resolved')} className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Mark resolved</button>
                          )}
                          <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600">{issue.status}</span>
                        </div>
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

export default Governance;
