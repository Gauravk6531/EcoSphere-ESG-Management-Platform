import API from './api';

export const getDepartments = () => API.get('/departments').then((res) => res.data.data);
export const getUsers = () => API.get('/auth/users').then((res) => res.data.data);
export const getCategories = (type) => API.get('/categories', { params: { type } }).then((res) => res.data.data);
export const createCategory = (payload) => API.post('/categories', payload).then((res) => res.data.data);

// Social
export const getSocialDashboard = (departmentId) => API.get('/social/dashboard', { params: { department_id: departmentId } }).then((res) => res.data.data);
export const getActivities = (departmentId) => API.get('/social/activities', { params: { department_id: departmentId } }).then((res) => res.data.data);
export const createActivity = (payload) => API.post('/social/activities', payload).then((res) => res.data.data);
export const deleteActivity = (id) => API.delete(`/social/activities/${id}`).then((res) => res.data.data);
export const getParticipations = (params) => API.get('/social/participations', { params }).then((res) => res.data.data);
export const createParticipation = (payload) => API.post('/social/participations', payload).then((res) => res.data.data);
export const decideParticipation = (id, payload) => API.post(`/social/participations/${id}/decision`, payload).then((res) => res.data.data);
export const getDiversityMetrics = (departmentId) => API.get('/social/diversity-metrics', { params: { department_id: departmentId } }).then((res) => res.data.data);
export const getTrainingCompletions = (params) => API.get('/social/training-completions', { params }).then((res) => res.data.data);
export const createTrainingCompletion = (payload) => API.post('/social/training-completions', payload).then((res) => res.data.data);
export const updateTrainingCompletion = (id, payload) => API.put(`/social/training-completions/${id}`, payload).then((res) => res.data.data);
export const deleteTrainingCompletion = (id) => API.delete(`/social/training-completions/${id}`).then((res) => res.data.data);

// Governance
export const getPolicies = () => API.get('/governance/policies').then((res) => res.data.data);
export const createPolicy = (payload) => API.post('/governance/policies', payload).then((res) => res.data.data);
export const deletePolicy = (id) => API.delete(`/governance/policies/${id}`).then((res) => res.data.data);
export const getAcknowledgements = (params) => API.get('/governance/acknowledgements', { params }).then((res) => res.data.data);
export const acknowledgePolicy = (payload) => API.post('/governance/acknowledgements', payload).then((res) => res.data.data);
export const sendReminder = (id) => API.post(`/governance/acknowledgements/${id}/send-reminder`).then((res) => res.data.data);
export const getAudits = (departmentId) => API.get('/governance/audits', { params: { department_id: departmentId } }).then((res) => res.data.data);
export const createAudit = (payload) => API.post('/governance/audits', payload).then((res) => res.data.data);
export const deleteAudit = (id) => API.delete(`/governance/audits/${id}`).then((res) => res.data.data);
export const getComplianceIssues = (status) => API.get('/governance/compliance-issues', { params: { status } }).then((res) => res.data.data);
export const createComplianceIssue = (payload) => API.post('/governance/compliance-issues', payload).then((res) => res.data.data);
export const updateComplianceIssue = (id, payload) => API.put(`/governance/compliance-issues/${id}`, payload).then((res) => res.data.data);
export const getOverdueIssues = () => API.get('/governance/compliance-issues/overdue').then((res) => res.data.data);

// Gamification
export const getBadges = () => API.get('/gamification/badges').then((res) => res.data.data);
export const createBadge = (payload) => API.post('/gamification/badges', payload).then((res) => res.data.data);
export const deleteBadge = (id) => API.delete(`/gamification/badges/${id}`).then((res) => res.data.data);
export const getEmployeeBadges = (employeeId) => API.get(`/gamification/employees/${employeeId}/badges`).then((res) => res.data.data);
export const getRewards = () => API.get('/gamification/rewards').then((res) => res.data.data);
export const createReward = (payload) => API.post('/gamification/rewards', payload).then((res) => res.data.data);
export const deleteReward = (id) => API.delete(`/gamification/rewards/${id}`).then((res) => res.data.data);
export const redeemReward = (payload) => API.post('/gamification/rewards/redeem', payload).then((res) => res.data.data);
export const getRedemptions = (params) => API.get('/gamification/redemptions', { params }).then((res) => res.data.data);
export const getChallenges = (status) => API.get('/gamification/challenges', { params: { status } }).then((res) => res.data.data);
export const createChallenge = (payload) => API.post('/gamification/challenges', payload).then((res) => res.data.data);
export const updateChallengeStatus = (id, status) => API.put(`/gamification/challenges/${id}/status`, { status }).then((res) => res.data.data);
export const deleteChallenge = (id) => API.delete(`/gamification/challenges/${id}`).then((res) => res.data.data);
export const getChallengeParticipations = (params) => API.get('/gamification/challenge-participations', { params }).then((res) => res.data.data);
export const createChallengeParticipation = (payload) => API.post('/gamification/challenge-participations', payload).then((res) => res.data.data);
export const decideChallengeParticipation = (id, payload) => API.post(`/gamification/challenge-participations/${id}/decision`, payload).then((res) => res.data.data);
export const getLeaderboard = (departmentId) => API.get('/gamification/leaderboard', { params: { department_id: departmentId } }).then((res) => res.data.data);
