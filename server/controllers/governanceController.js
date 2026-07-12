const {
  ESGPolicy,
  PolicyAcknowledgement,
  Audit,
  ComplianceIssue,
} = require("../models");
const { notify } = require("../services/notificationService");
const { sanitizePayload } = require("../utils/sanitize");

const listPolicies = async (req, res) => res.json(await ESGPolicy.find());
const createPolicy = async (req, res) => res.status(201).json(await ESGPolicy.create(sanitizePayload(req.body)));
const deletePolicy = async (req, res) => {
  const row = await ESGPolicy.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Policy not found" });
  res.json({ ok: true });
};

const listAcknowledgements = async (req, res) => {
  const filter = {};
  if (req.query.policy_id) filter.policy_id = req.query.policy_id;
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  res.json(await PolicyAcknowledgement.find(filter));
};
const acknowledgePolicy = async (req, res) => {
  const row = await PolicyAcknowledgement.create({ ...sanitizePayload(req.body), acknowledged_date: new Date() });
  res.status(201).json(row);
};
const sendReminder = async (req, res) => {
  const ack = await PolicyAcknowledgement.findByIdAndUpdate(req.params.id, { reminder_sent: true }, { new: true });
  if (!ack) return res.status(404).json({ detail: "Acknowledgement not found" });
  await notify(ack.employee_id, "policy_reminder", "Please acknowledge the assigned ESG policy.", "notify_policy_reminder");
  res.json(ack);
};

const listAudits = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  res.json(await Audit.find(filter));
};
const createAudit = async (req, res) => res.status(201).json(await Audit.create(sanitizePayload(req.body)));
const deleteAudit = async (req, res) => {
  const row = await Audit.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Audit not found" });
  res.json({ ok: true });
};

const listComplianceIssues = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await ComplianceIssue.find(filter));
};
const createComplianceIssue = async (req, res) => {
  const row = await ComplianceIssue.create(sanitizePayload(req.body));
  await notify(row.owner_id, "compliance_issue", "A compliance issue has been assigned to you.", "notify_compliance_issue");
  res.status(201).json(row);
};
const updateComplianceIssue = async (req, res) => {
  const row = await ComplianceIssue.findByIdAndUpdate(req.params.id, sanitizePayload(req.body), { new: true });
  if (!row) return res.status(404).json({ detail: "Compliance issue not found" });
  res.json(row);
};
const overdueIssues = async (req, res) => {
  res.json(await ComplianceIssue.find({
    status: { $in: ["open", "in_progress"] },
    due_date: { $lt: new Date() },
  }));
};

module.exports = {
  listPolicies,
  createPolicy,
  deletePolicy,
  listAcknowledgements,
  acknowledgePolicy,
  sendReminder,
  listAudits,
  createAudit,
  deleteAudit,
  listComplianceIssues,
  createComplianceIssue,
  updateComplianceIssue,
  overdueIssues,
};
