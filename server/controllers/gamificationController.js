const {
  Badge,
  EmployeeBadge,
  Reward,
  RewardRedemption,
  Challenge,
  ChallengeParticipation,
  Employee,
} = require("../models");
const { checkAndAwardBadges } = require("../services/badgeService");
const { notify } = require("../services/notificationService");
const { sanitizePayload } = require("../utils/sanitize");

const listBadges = async (req, res) => res.json(await Badge.find());
const createBadge = async (req, res) => res.status(201).json(await Badge.create(sanitizePayload(req.body)));
const deleteBadge = async (req, res) => {
  const row = await Badge.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Badge not found" });
  res.json({ ok: true });
};
const employeeBadges = async (req, res) => res.json(await EmployeeBadge.find({ employee_id: req.params.employeeId }));
const forceCheckBadges = async (req, res) => res.json(await checkAndAwardBadges(req.params.employeeId));

const listRewards = async (req, res) => res.json(await Reward.find());
const createReward = async (req, res) => res.status(201).json(await Reward.create(sanitizePayload(req.body)));
const updateReward = async (req, res) => {
  const row = await Reward.findByIdAndUpdate(req.params.id, sanitizePayload(req.body), { new: true });
  if (!row) return res.status(404).json({ detail: "Reward not found" });
  res.json(row);
};
const deleteReward = async (req, res) => {
  const row = await Reward.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Reward not found" });
  res.json({ ok: true });
};
const redeemReward = async (req, res) => {
  const reward = await Reward.findById(req.body.reward_id);
  const employee = await Employee.findById(req.body.employee_id);
  if (!reward || !employee) return res.status(404).json({ detail: "Reward or employee not found" });
  if (reward.status !== "active") return res.status(400).json({ detail: "Reward is not active" });
  if (reward.stock <= 0) return res.status(400).json({ detail: "Reward is out of stock" });
  if ((employee.points_balance || 0) < reward.points_required) return res.status(400).json({ detail: "Insufficient points balance" });

  reward.stock -= 1;
  employee.points_balance -= reward.points_required;
  await Promise.all([reward.save(), employee.save()]);
  const redemption = await RewardRedemption.create({
    employee_id: employee.id,
    reward_id: reward.id,
    points_deducted: reward.points_required,
  });
  res.status(201).json(redemption);
};
const listRedemptions = async (req, res) => {
  const filter = req.query.employee_id ? { employee_id: req.query.employee_id } : {};
  res.json(await RewardRedemption.find(filter).sort({ date: -1 }));
};

const listChallenges = async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Challenge.find(filter));
};
const createChallenge = async (req, res) => res.status(201).json(await Challenge.create(sanitizePayload(req.body)));
const updateChallenge = async (req, res) => {
  const row = await Challenge.findByIdAndUpdate(req.params.id, sanitizePayload(req.body), { new: true });
  if (!row) return res.status(404).json({ detail: "Challenge not found" });
  res.json(row);
};
const validTransitions = {
  draft: new Set(["active", "archived"]),
  active: new Set(["under_review", "archived"]),
  under_review: new Set(["completed", "active", "archived"]),
  completed: new Set(["archived"]),
  archived: new Set(),
};
const updateChallengeStatus = async (req, res) => {
  const challenge = await Challenge.findById(req.params.id);
  if (!challenge) return res.status(404).json({ detail: "Challenge not found" });
  const next = req.body.status;
  if (next !== challenge.status && !validTransitions[challenge.status]?.has(next)) {
    return res.status(400).json({ detail: `Cannot move challenge from '${challenge.status}' to '${next}'` });
  }
  challenge.status = next;
  await challenge.save();
  res.json(challenge);
};
const deleteChallenge = async (req, res) => {
  const row = await Challenge.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Challenge not found" });
  res.json({ ok: true });
};

const listChallengeParticipations = async (req, res) => {
  const filter = {};
  if (req.query.challenge_id) filter.challenge_id = req.query.challenge_id;
  if (req.query.employee_id) filter.employee_id = req.query.employee_id;
  res.json(await ChallengeParticipation.find(filter));
};
const createChallengeParticipation = async (req, res) => {
  const row = await ChallengeParticipation.create({ ...sanitizePayload(req.body), approval_status: "submitted" });
  res.status(201).json(row);
};
const decideChallengeParticipation = async (req, res) => {
  const participation = await ChallengeParticipation.findById(req.params.id);
  if (!participation) return res.status(404).json({ detail: "Challenge participation not found" });
  const challenge = await Challenge.findById(participation.challenge_id);
  const approve = Boolean(req.body.approve);
  if (approve) {
    if (challenge?.evidence_required && !participation.proof_url) {
      return res.status(400).json({ detail: "Cannot approve: proof file is required for this challenge" });
    }
    participation.approval_status = "approved";
    participation.xp_awarded = challenge?.xp || 0;
    participation.progress = 100;
    await Employee.findByIdAndUpdate(participation.employee_id, {
      $inc: { xp_total: participation.xp_awarded, points_balance: participation.xp_awarded },
    });
    await participation.save();
    await checkAndAwardBadges(participation.employee_id);
  } else {
    participation.approval_status = "rejected";
    await participation.save();
  }
  await notify(participation.employee_id, "challenge_approval_decision", `Your challenge submission was ${approve ? "approved" : "rejected"}.`, "notify_approval_decision");
  res.json(participation);
};

const leaderboard = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  const limit = Number(req.query.limit || 20);
  const employees = await Employee.find(filter).sort({ xp_total: -1 }).limit(limit);
  res.json(employees.map((employee, idx) => ({
    rank: idx + 1,
    employee_id: employee.id,
    name: employee.name,
    department_id: employee.department_id,
    xp_total: employee.xp_total,
    points_balance: employee.points_balance,
  })));
};

module.exports = {
  listBadges,
  createBadge,
  deleteBadge,
  employeeBadges,
  forceCheckBadges,
  listRewards,
  createReward,
  updateReward,
  deleteReward,
  redeemReward,
  listRedemptions,
  listChallenges,
  createChallenge,
  updateChallenge,
  updateChallengeStatus,
  deleteChallenge,
  listChallengeParticipations,
  createChallengeParticipation,
  decideChallengeParticipation,
  leaderboard,
};
