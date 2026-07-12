const {
  Badge,
  Employee,
  EmployeeBadge,
  ChallengeParticipation,
  EmployeeParticipation,
} = require("../models");
const { getConfig } = require("./configService");
const { notify } = require("./notificationService");

function compare(actual, comparator, threshold) {
  if (comparator === ">") return actual > threshold;
  if (comparator === "==") return actual === threshold;
  return actual >= threshold;
}

async function metricValue(employeeId, metric) {
  if (metric === "completed_challenges") {
    return ChallengeParticipation.countDocuments({ employee_id: employeeId, approval_status: "approved" });
  }
  if (metric === "csr_participations") {
    return EmployeeParticipation.countDocuments({ employee_id: employeeId, approval_status: "approved" });
  }
  const employee = await Employee.findById(employeeId);
  return employee?.xp_total || 0;
}

async function checkAndAwardBadges(employeeId) {
  const config = await getConfig();
  if (!config.badge_auto_award) return [];

  const badges = await Badge.find();
  const awarded = [];
  for (const badge of badges) {
    const exists = await EmployeeBadge.findOne({ employee_id: employeeId, badge_id: badge.id });
    if (exists) continue;
    const value = await metricValue(employeeId, badge.unlock_metric);
    if (compare(value, badge.unlock_comparator, badge.unlock_threshold)) {
      const employeeBadge = await EmployeeBadge.create({ employee_id: employeeId, badge_id: badge.id });
      await notify(employeeId, "badge_unlock", `You unlocked the ${badge.name} badge.`, "notify_badge_unlock");
      awarded.push(employeeBadge);
    }
  }
  return awarded;
}

module.exports = { checkAndAwardBadges };
