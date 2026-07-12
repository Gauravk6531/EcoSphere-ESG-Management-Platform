const {
  Department,
  DepartmentScore,
  EnvironmentalGoal,
  Employee,
  EmployeeParticipation,
  PolicyAcknowledgement,
  ComplianceIssue,
} = require("../models");
const { getConfig } = require("./configService");

function round(value) {
  return Math.round(value * 100) / 100;
}

async function computeDepartmentScore(department) {
  const employees = await Employee.find({ department_id: department.id });
  const employeeIds = employees.map((e) => e.id);

  const goals = await EnvironmentalGoal.find({ department_id: department.id });
  const environmental = goals.length
    ? goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / goals.length
    : 0;

  const approvedParticipations = employeeIds.length
    ? await EmployeeParticipation.countDocuments({ employee_id: { $in: employeeIds }, approval_status: "approved" })
    : 0;
  const social = employees.length ? Math.min(100, (approvedParticipations / employees.length) * 100) : 0;

  const acknowledgements = employeeIds.length
    ? await PolicyAcknowledgement.countDocuments({ employee_id: { $in: employeeIds } })
    : 0;
  const openIssues = employeeIds.length
    ? await ComplianceIssue.countDocuments({ owner_id: { $in: employeeIds }, status: { $in: ["open", "in_progress"] } })
    : 0;
  const governance = Math.max(0, Math.min(100, acknowledgements * 25 - openIssues * 10));

  const config = await getConfig();
  const totalWeight = config.weight_environmental + config.weight_social + config.weight_governance || 100;
  const total = (
    environmental * config.weight_environmental +
    social * config.weight_social +
    governance * config.weight_governance
  ) / totalWeight;

  return DepartmentScore.create({
    department_id: department.id,
    environmental_score: round(environmental),
    social_score: round(social),
    governance_score: round(governance),
    total_score: round(total),
    period: new Date(),
  });
}

async function computeAllDepartmentScores() {
  const departments = await Department.find();
  const rows = [];
  for (const department of departments) {
    rows.push(await computeDepartmentScore(department));
  }
  return rows;
}

async function computeOverallESGScore() {
  const latestScores = [];
  const departments = await Department.find();
  for (const department of departments) {
    const latest = await DepartmentScore.findOne({ department_id: department.id }).sort({ period: -1, createdAt: -1 });
    if (latest) latestScores.push(latest.total_score);
  }
  if (!latestScores.length) return 0;
  return round(latestScores.reduce((sum, score) => sum + score, 0) / latestScores.length);
}

module.exports = { computeAllDepartmentScores, computeOverallESGScore };
