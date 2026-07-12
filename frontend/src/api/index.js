import client from "./client";

// ---------- Core ----------
export const getEmployees = () => client.get("/employees").then((r) => r.data);
export const createEmployee = (data) => client.post("/employees", data).then((r) => r.data);

export const getDepartments = () => client.get("/departments").then((r) => r.data);
export const createDepartment = (data) => client.post("/departments", data).then((r) => r.data);
export const updateDepartment = (id, data) => client.put(`/departments/${id}`, data).then((r) => r.data);
export const deleteDepartment = (id) => client.delete(`/departments/${id}`).then((r) => r.data);

export const getCategories = () => client.get("/categories").then((r) => r.data);
export const createCategory = (data) => client.post("/categories", data).then((r) => r.data);
export const deleteCategory = (id) => client.delete(`/categories/${id}`).then((r) => r.data);

export const getNotifications = (employeeId) =>
  client.get("/notifications", { params: { employee_id: employeeId } }).then((r) => r.data);
export const markNotificationRead = (id) => client.post(`/notifications/${id}/read`).then((r) => r.data);

export const getConfig = () => client.get("/config").then((r) => r.data);
export const updateConfig = (data) => client.put("/config", data).then((r) => r.data);

// ---------- Environmental ----------
export const getEmissionFactors = () => client.get("/environmental/emission-factors").then((r) => r.data);
export const createEmissionFactor = (data) => client.post("/environmental/emission-factors", data).then((r) => r.data);
export const deleteEmissionFactor = (id) => client.delete(`/environmental/emission-factors/${id}`).then((r) => r.data);

export const getCarbonTransactions = (departmentId) =>
  client.get("/environmental/carbon-transactions", { params: { department_id: departmentId } }).then((r) => r.data);
export const createCarbonTransaction = (data) => client.post("/environmental/carbon-transactions", data).then((r) => r.data);

export const getGoals = (departmentId) =>
  client.get("/environmental/goals", { params: { department_id: departmentId } }).then((r) => r.data);
export const createGoal = (data) => client.post("/environmental/goals", data).then((r) => r.data);
export const updateGoal = (id, data) => client.put(`/environmental/goals/${id}`, data).then((r) => r.data);
export const deleteGoal = (id) => client.delete(`/environmental/goals/${id}`).then((r) => r.data);

export const getProductProfiles = () => client.get("/environmental/product-profiles").then((r) => r.data);
export const createProductProfile = (data) => client.post("/environmental/product-profiles", data).then((r) => r.data);

// ---------- Social ----------
export const getActivities = (departmentId) =>
  client.get("/social/activities", { params: { department_id: departmentId } }).then((r) => r.data);
export const createActivity = (data) => client.post("/social/activities", data).then((r) => r.data);
export const deleteActivity = (id) => client.delete(`/social/activities/${id}`).then((r) => r.data);

export const getParticipations = (params) => client.get("/social/participations", { params }).then((r) => r.data);
export const createParticipation = (data) => client.post("/social/participations", data).then((r) => r.data);
export const decideParticipation = (id, data) =>
  client.post(`/social/participations/${id}/decision`, data).then((r) => r.data);

export const getDiversityMetrics = (departmentId) =>
  client.get("/social/diversity-metrics", { params: { department_id: departmentId } }).then((r) => r.data);
export const getSocialDashboard = (departmentId) =>
  client.get("/social/dashboard", { params: { department_id: departmentId } }).then((r) => r.data);
export const getTrainingCompletions = (params) =>
  client.get("/social/training-completions", { params }).then((r) => r.data);
export const createTrainingCompletion = (data) => client.post("/social/training-completions", data).then((r) => r.data);
export const updateTrainingCompletion = (id, data) =>
  client.put(`/social/training-completions/${id}`, data).then((r) => r.data);
export const deleteTrainingCompletion = (id) => client.delete(`/social/training-completions/${id}`).then((r) => r.data);

// ---------- Governance ----------
export const getPolicies = () => client.get("/governance/policies").then((r) => r.data);
export const createPolicy = (data) => client.post("/governance/policies", data).then((r) => r.data);
export const deletePolicy = (id) => client.delete(`/governance/policies/${id}`).then((r) => r.data);

export const getAcknowledgements = (params) => client.get("/governance/acknowledgements", { params }).then((r) => r.data);
export const acknowledgePolicy = (data) => client.post("/governance/acknowledgements", data).then((r) => r.data);
export const sendReminder = (id) => client.post(`/governance/acknowledgements/${id}/send-reminder`).then((r) => r.data);

export const getAudits = (departmentId) =>
  client.get("/governance/audits", { params: { department_id: departmentId } }).then((r) => r.data);
export const createAudit = (data) => client.post("/governance/audits", data).then((r) => r.data);
export const deleteAudit = (id) => client.delete(`/governance/audits/${id}`).then((r) => r.data);

export const getComplianceIssues = (status) =>
  client.get("/governance/compliance-issues", { params: { status } }).then((r) => r.data);
export const createComplianceIssue = (data) => client.post("/governance/compliance-issues", data).then((r) => r.data);
export const updateComplianceIssue = (id, data) => client.put(`/governance/compliance-issues/${id}`, data).then((r) => r.data);
export const getOverdueIssues = () => client.get("/governance/compliance-issues/overdue").then((r) => r.data);

// ---------- Gamification ----------
export const getBadges = () => client.get("/gamification/badges").then((r) => r.data);
export const createBadge = (data) => client.post("/gamification/badges", data).then((r) => r.data);
export const deleteBadge = (id) => client.delete(`/gamification/badges/${id}`).then((r) => r.data);
export const getEmployeeBadges = (employeeId) => client.get(`/gamification/employees/${employeeId}/badges`).then((r) => r.data);

export const getRewards = () => client.get("/gamification/rewards").then((r) => r.data);
export const createReward = (data) => client.post("/gamification/rewards", data).then((r) => r.data);
export const deleteReward = (id) => client.delete(`/gamification/rewards/${id}`).then((r) => r.data);
export const redeemReward = (data) => client.post("/gamification/rewards/redeem", data).then((r) => r.data);
export const getRedemptions = (employeeId) =>
  client.get("/gamification/redemptions", { params: { employee_id: employeeId } }).then((r) => r.data);

export const getChallenges = (status) => client.get("/gamification/challenges", { params: { status } }).then((r) => r.data);
export const createChallenge = (data) => client.post("/gamification/challenges", data).then((r) => r.data);
export const updateChallengeStatus = (id, status) =>
  client.put(`/gamification/challenges/${id}/status`, { status }).then((r) => r.data);
export const deleteChallenge = (id) => client.delete(`/gamification/challenges/${id}`).then((r) => r.data);

export const getChallengeParticipations = (params) =>
  client.get("/gamification/challenge-participations", { params }).then((r) => r.data);
export const createChallengeParticipation = (data) =>
  client.post("/gamification/challenge-participations", data).then((r) => r.data);
export const decideChallengeParticipation = (id, data) =>
  client.post(`/gamification/challenge-participations/${id}/decision`, data).then((r) => r.data);

export const getLeaderboard = (departmentId) =>
  client.get("/gamification/leaderboard", { params: { department_id: departmentId } }).then((r) => r.data);

// ---------- Dashboard / Reports ----------
export const getDashboardOverview = () => client.get("/dashboard/overview").then((r) => r.data);
export const recalculateScores = () => client.post("/dashboard/recalculate").then((r) => r.data);
export const getDepartmentScoreHistory = (departmentId) =>
  client.get("/dashboard/department-scores", { params: { department_id: departmentId } }).then((r) => r.data);

export const getCustomReport = (params) => client.get("/reports/custom", { params }).then((r) => r.data);
export const customReportCsvUrl = (params) => {
  const query = new URLSearchParams({ ...params, export: "csv" }).toString();
  return `${client.defaults.baseURL}/reports/custom?${query}`;
};
