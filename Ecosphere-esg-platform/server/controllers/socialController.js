import CSRActivity from '../models/CSRActivity.js';
import EmployeeParticipation from '../models/EmployeeParticipation.js';
import TrainingCompletion from '../models/TrainingCompletion.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Category from '../models/Category.js';

export const listActivities = async (req, res) => {
  const filter = req.query.department_id ? { department: req.query.department_id } : {};
  const activities = await CSRActivity.find(filter).populate('category', 'name');
  res.status(200).json({ status: 'success', data: activities });
};

export const createActivity = async (req, res) => {
  const activity = await CSRActivity.create(req.body);
  res.status(201).json({ status: 'success', data: activity });
};

export const deleteActivity = async (req, res) => {
  const activity = await CSRActivity.findByIdAndDelete(req.params.id);
  if (!activity) return res.status(404).json({ status: 'error', message: 'Activity not found' });
  res.status(200).json({ status: 'success', message: 'Activity deleted' });
};

export const listParticipations = async (req, res) => {
  const filter = {};
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.activity_id) filter.activity_id = req.query.activity_id;
  const rows = await EmployeeParticipation.find(filter).populate('activity_id', 'title').populate('employee_id', 'name email');
  res.status(200).json({ status: 'success', data: rows });
};

export const createParticipation = async (req, res) => {
  const row = await EmployeeParticipation.create({ ...req.body, approval_status: 'submitted' });
  res.status(201).json({ status: 'success', data: row });
};

export const decideParticipation = async (req, res) => {
  const participation = await EmployeeParticipation.findById(req.params.id);
  if (!participation) return res.status(404).json({ status: 'error', message: 'Participation not found' });
  const approve = Boolean(req.body.approve);
  if (approve) {
    participation.approval_status = 'approved';
    participation.points_earned = Number(req.body.points_earned || participation.points_earned || 0);
    participation.completion_date = participation.completion_date || new Date();
    await participation.save();
    if (participation.points_earned) {
      await User.findByIdAndUpdate(participation.employee_id, { $inc: { points_balance: participation.points_earned, xp_total: participation.points_earned } });
    }
  } else {
    participation.approval_status = 'rejected';
    await participation.save();
  }
  res.status(200).json({ status: 'success', data: participation });
};

export const diversityMetrics = async (req, res) => {
  const filter = req.query.department_id ? { department: req.query.department_id } : {};
  const count = await User.countDocuments(filter);
  res.status(200).json({ status: 'success', data: { total_employees: count, department_id: req.query.department_id || null, note: 'Add demographic fields to enrich metrics.' } });
};

export const socialDashboard = async (req, res) => {
  const departmentFilter = req.query.department_id ? { department: req.query.department_id } : {};
  const employees = await User.find(departmentFilter).select('name department role');
  const activityFilter = req.query.department_id ? { department: req.query.department_id } : {};
  const activities = await CSRActivity.find(activityFilter);
  const participations = await EmployeeParticipation.find().populate('activity_id', 'title');
  const trainings = await TrainingCompletion.find(departmentFilter);

  const approvedParticipations = participations.filter((p) => p.approval_status === 'approved');
  const statusCounts = participations.reduce((acc, p) => {
    acc[p.approval_status] = (acc[p.approval_status] || 0) + 1;
    return acc;
  }, {});
  const trainingStatusCounts = trainings.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const departmentBreakdown = await Promise.all(
    (await Department.find()).map(async (department) => {
      const deptEmployees = employees.filter((e) => String(e.department) === String(department._id));
      const deptEmployeeIds = deptEmployees.map((e) => String(e._id));
      const deptParticipations = participations.filter((p) => deptEmployeeIds.includes(String(p.employee_id)));
      return {
        department_id: department._id,
        department_name: department.name,
        employees: deptEmployees.length,
        csr_participations: deptParticipations.length,
        points_earned: deptParticipations.reduce((sum, p) => sum + (p.points_earned || 0), 0),
      };
    })
  );

  res.status(200).json({ status: 'success', data: {
    total_csr_activities: activities.length,
    total_participations: participations.length,
    approved_participations: approvedParticipations.length,
    pending_participations: statusCounts.submitted || 0,
    csr_points_awarded: approvedParticipations.reduce((sum, p) => sum + (p.points_earned || 0), 0),
    training_records: trainings.length,
    training_completed: trainings.filter((t) => t.status === 'completed').length,
    training_completion_rate: trainings.length ? Math.round((trainings.filter((t) => t.status === 'completed').length / trainings.length) * 100) : 0,
    participation_status_counts: statusCounts,
    training_status_counts: trainingStatusCounts,
    department_breakdown: departmentBreakdown,
    recent_activities: activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
  }});
};

export const listTrainingCompletions = async (req, res) => {
  const filter = {};
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  if (req.query.status) filter.status = req.query.status;
  const rows = await TrainingCompletion.find(filter).sort({ due_date: 1 });
  res.status(200).json({ status: 'success', data: rows });
};

export const createTrainingCompletion = async (req, res) => {
  const row = await TrainingCompletion.create(req.body);
  res.status(201).json({ status: 'success', data: row });
};

export const updateTrainingCompletion = async (req, res) => {
  const row = await TrainingCompletion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!row) return res.status(404).json({ status: 'error', message: 'Training completion not found' });
  res.status(200).json({ status: 'success', data: row });
};

export const deleteTrainingCompletion = async (req, res) => {
  const row = await TrainingCompletion.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ status: 'error', message: 'Training completion not found' });
  res.status(200).json({ status: 'success', message: 'Training completion deleted' });
};
