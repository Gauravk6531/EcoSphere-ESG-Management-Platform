const {
  Employee,
  CSRActivity,
  EmployeeParticipation,
  TrainingCompletion,
  Department,
} = require("../models");
const { getConfig } = require("../services/configService");
const { checkAndAwardBadges } = require("../services/badgeService");
const { notify } = require("../services/notificationService");
const { sanitizePayload } = require("../utils/sanitize");

const listActivities = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  res.json(await CSRActivity.find(filter));
};
const createActivity = async (req, res) => res.status(201).json(await CSRActivity.create(sanitizePayload(req.body)));
const deleteActivity = async (req, res) => {
  const row = await CSRActivity.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Activity not found" });
  res.json({ ok: true });
};

const listParticipations = async (req, res) => {
  const filter = {};
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.activity_id) filter.activity_id = req.query.activity_id;
  res.json(await EmployeeParticipation.find(filter));
};
const createParticipation = async (req, res) => {
  const row = await EmployeeParticipation.create({ ...sanitizePayload(req.body), approval_status: "submitted" });
  res.status(201).json(row);
};
const decideParticipation = async (req, res) => {
  const participation = await EmployeeParticipation.findById(req.params.id);
  if (!participation) return res.status(404).json({ detail: "Participation not found" });
  const approve = Boolean(req.body.approve);
  if (approve) {
    const config = await getConfig();
    const activity = await CSRActivity.findById(participation.activity_id);
    if (config.evidence_required && activity?.evidence_required && !participation.proof_url) {
      return res.status(400).json({ detail: "Cannot approve: proof file is required for this activity" });
    }
    participation.approval_status = "approved";
    participation.points_earned = Number(req.body.points_earned || 0);
    participation.completion_date = participation.completion_date || new Date();
    await Employee.findByIdAndUpdate(participation.employee_id, { $inc: { points_balance: participation.points_earned } });
    await participation.save();
    await checkAndAwardBadges(participation.employee_id);
  } else {
    participation.approval_status = "rejected";
    await participation.save();
  }
  await notify(participation.employee_id, "csr_approval_decision", `Your CSR participation was ${approve ? "approved" : "rejected"}.`, "notify_approval_decision");
  res.json(participation);
};

const diversityMetrics = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  const count = await Employee.countDocuments(filter);
  res.json({
    total_employees: count,
    department_id: req.query.department_id || null,
    note: "Extend Employee model with gender/age/tenure fields to enrich this metric.",
  });
};

const listTrainingCompletions = async (req, res) => {
  const filter = {};
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.status) filter.status = req.query.status;
  res.json(await TrainingCompletion.find(filter).sort({ due_date: 1, createdAt: -1 }));
};
const createTrainingCompletion = async (req, res) => res.status(201).json(await TrainingCompletion.create(sanitizePayload(req.body)));
const updateTrainingCompletion = async (req, res) => {
  const row = await TrainingCompletion.findByIdAndUpdate(req.params.id, sanitizePayload(req.body), { new: true });
  if (!row) return res.status(404).json({ detail: "Training completion not found" });
  res.json(row);
};
const deleteTrainingCompletion = async (req, res) => {
  const row = await TrainingCompletion.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Training completion not found" });
  res.json({ ok: true });
};

const socialDashboard = async (req, res) => {
  const employeeFilter = req.query.department_id ? { department_id: req.query.department_id } : {};
  const employees = await Employee.find(employeeFilter);
  const employeeIds = employees.map((e) => e.id);
  const activityFilter = req.query.department_id ? { department_id: req.query.department_id } : {};
  const activities = await CSRActivity.find(activityFilter);
  const participationFilter = req.query.department_id ? { employee_id: { $in: employeeIds } } : {};
  const participations = await EmployeeParticipation.find(participationFilter);
  const trainings = await TrainingCompletion.find(participationFilter);

  const statusCounts = {};
  participations.forEach((p) => { statusCounts[p.approval_status] = (statusCounts[p.approval_status] || 0) + 1; });
  const trainingStatusCounts = {};
  trainings.forEach((t) => { trainingStatusCounts[t.status] = (trainingStatusCounts[t.status] || 0) + 1; });
  const completedTraining = trainings.filter((t) => t.status === "completed");
  const approvedParticipations = participations.filter((p) => p.approval_status === "approved");

  const departments = await Department.find();
  const department_breakdown = [];
  for (const department of departments) {
    const deptEmployees = employees.filter((e) => String(e.department_id || "") === department.id);
    const deptEmployeeIds = deptEmployees.map((e) => e.id);
    const deptParticipations = participations.filter((p) => deptEmployeeIds.includes(String(p.employee_id)));
    department_breakdown.push({
      department_id: department.id,
      department_name: department.name,
      employees: deptEmployees.length,
      csr_participations: deptParticipations.length,
      points_earned: deptParticipations.reduce((sum, p) => sum + (p.points_earned || 0), 0),
    });
  }

  res.json({
    total_csr_activities: activities.length,
    total_participations: participations.length,
    approved_participations: approvedParticipations.length,
    pending_participations: statusCounts.submitted || 0,
    csr_points_awarded: approvedParticipations.reduce((sum, p) => sum + (p.points_earned || 0), 0),
    training_records: trainings.length,
    training_completed: completedTraining.length,
    training_completion_rate: trainings.length ? Math.round((completedTraining.length / trainings.length) * 10000) / 100 : 0,
    participation_status_counts: statusCounts,
    training_status_counts: trainingStatusCounts,
    department_breakdown,
    recent_activities: activities.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5),
  });
};

module.exports = {
  listActivities,
  createActivity,
  deleteActivity,
  listParticipations,
  createParticipation,
  decideParticipation,
  diversityMetrics,
  listTrainingCompletions,
  createTrainingCompletion,
  updateTrainingCompletion,
  deleteTrainingCompletion,
  socialDashboard,
};
