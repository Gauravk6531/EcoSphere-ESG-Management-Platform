import ESGPolicy from '../models/ESGPolicy.js';
import PolicyAcknowledgement from '../models/PolicyAcknowledgement.js';
import Audit from '../models/Audit.js';
import ComplianceIssue from '../models/ComplianceIssue.js';
import User from '../models/User.js';
import Department from '../models/Department.js';

export const getPolicies = async (req, res) => {
  try {
    const filter = req.query.department_id ? { department_ids: req.query.department_id } : {};
    const policies = await ESGPolicy.find(filter).populate('department_ids', 'name');
    res.status(200).json({ status: 'success', count: policies.length, data: policies });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createPolicy = async (req, res) => {
  try {
    const policy = await ESGPolicy.create(req.body);
    res.status(201).json({ status: 'success', data: policy });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deletePolicy = async (req, res) => {
  try {
    const policy = await ESGPolicy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ status: 'error', message: 'Policy not found' });
    res.status(200).json({ status: 'success', message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getAcknowledgements = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;
    const acknowledgements = await PolicyAcknowledgement.find(filter)
      .populate('policy_id', 'name version status')
      .populate('employee_id', 'name email');
    res.status(200).json({ status: 'success', count: acknowledgements.length, data: acknowledgements });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const acknowledgePolicy = async (req, res) => {
  try {
    const { policy_id, employee_id } = req.body;
    const acknowledgement = await PolicyAcknowledgement.findOneAndUpdate(
      { policy_id, employee_id },
      { acknowledged_date: new Date(), reminder_sent: false },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('policy_id', 'name').populate('employee_id', 'name email');
    res.status(201).json({ status: 'success', data: acknowledgement });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const acknowledgement = await PolicyAcknowledgement.findById(req.params.id);
    if (!acknowledgement) return res.status(404).json({ status: 'error', message: 'Acknowledgement not found' });
    acknowledgement.reminder_sent = true;
    await acknowledgement.save();
    res.status(200).json({ status: 'success', data: acknowledgement });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getAudits = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department_id) filter.department = req.query.department_id;
    const audits = await Audit.find(filter).populate('department', 'name');
    res.status(200).json({ status: 'success', count: audits.length, data: audits });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createAudit = async (req, res) => {
  try {
    const audit = await Audit.create(req.body);
    res.status(201).json({ status: 'success', data: audit });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteAudit = async (req, res) => {
  try {
    const audit = await Audit.findByIdAndDelete(req.params.id);
    if (!audit) return res.status(404).json({ status: 'error', message: 'Audit not found' });
    res.status(200).json({ status: 'success', message: 'Audit deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getComplianceIssues = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const issues = await ComplianceIssue.find(filter)
      .populate('audit_id', 'title')
      .populate('owner_id', 'name email');
    res.status(200).json({ status: 'success', count: issues.length, data: issues });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createComplianceIssue = async (req, res) => {
  try {
    const issue = await ComplianceIssue.create(req.body);
    const populated = await ComplianceIssue.findById(issue._id)
      .populate('audit_id', 'title')
      .populate('owner_id', 'name email');
    res.status(201).json({ status: 'success', data: populated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateComplianceIssue = async (req, res) => {
  try {
    const issue = await ComplianceIssue.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!issue) return res.status(404).json({ status: 'error', message: 'Compliance issue not found' });
    res.status(200).json({ status: 'success', data: issue });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getOverdueIssues = async (req, res) => {
  try {
    const issues = await ComplianceIssue.find({ status: { $nin: ['resolved', 'closed'] }, due_date: { $lt: new Date() } })
      .populate('audit_id', 'title')
      .populate('owner_id', 'name email');
    res.status(200).json({ status: 'success', count: issues.length, data: issues });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
