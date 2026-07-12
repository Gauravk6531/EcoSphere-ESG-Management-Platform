import Badge from '../models/Badge.js';
import EmployeeBadge from '../models/EmployeeBadge.js';
import Reward from '../models/Reward.js';
import RewardRedemption from '../models/RewardRedemption.js';
import Challenge from '../models/Challenge.js';
import ChallengeParticipation from '../models/ChallengeParticipation.js';
import User from '../models/User.js';

export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find();
    res.status(200).json({ status: 'success', count: badges.length, data: badges });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createBadge = async (req, res) => {
  try {
    const badge = await Badge.create(req.body);
    res.status(201).json({ status: 'success', data: badge });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ status: 'error', message: 'Badge not found' });
    res.status(200).json({ status: 'success', message: 'Badge deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getEmployeeBadges = async (req, res) => {
  try {
    const badges = await EmployeeBadge.find({ employee_id: req.params.employeeId }).populate('badge_id', 'name description');
    res.status(200).json({ status: 'success', count: badges.length, data: badges });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find();
    res.status(200).json({ status: 'success', count: rewards.length, data: rewards });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createReward = async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.status(201).json({ status: 'success', data: reward });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findByIdAndDelete(req.params.id);
    if (!reward) return res.status(404).json({ status: 'error', message: 'Reward not found' });
    res.status(200).json({ status: 'success', message: 'Reward deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const redeemReward = async (req, res) => {
  try {
    const { employee_id, reward_id } = req.body;
    const reward = await Reward.findById(reward_id);
    if (!reward || reward.status !== 'active') return res.status(400).json({ status: 'error', message: 'Reward unavailable' });
    if (reward.stock <= 0) return res.status(400).json({ status: 'error', message: 'Reward out of stock' });

    const user = await User.findById(employee_id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    if ((user.points_balance || 0) < reward.points_required) {
      return res.status(400).json({ status: 'error', message: 'Insufficient points' });
    }

    reward.stock -= 1;
    await reward.save();
    user.points_balance = (user.points_balance || 0) - reward.points_required;
    await user.save();

    const redemption = await RewardRedemption.create({
      employee_id,
      reward_id,
      points_deducted: reward.points_required,
    });
    res.status(201).json({ status: 'success', data: redemption });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getRedemptions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;
    const redemptions = await RewardRedemption.find(filter)
      .populate('reward_id', 'name points_required')
      .populate('employee_id', 'name email');
    res.status(200).json({ status: 'success', count: redemptions.length, data: redemptions });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getChallenges = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const challenges = await Challenge.find(filter).populate('category', 'name');
    res.status(200).json({ status: 'success', count: challenges.length, data: challenges });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createChallenge = async (req, res) => {
  try {
    const { title, category_id, description, xp, difficulty, evidence_required, deadline } = req.body;
    const challenge = await Challenge.create({
      title,
      category: category_id || null,
      description,
      xp: Number(xp || 0),
      difficulty,
      evidence_required: Boolean(evidence_required),
      deadline: deadline || null
    });
    const populated = await Challenge.findById(challenge._id).populate('category', 'name');
    res.status(201).json({ status: 'success', data: populated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateChallengeStatus = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ status: 'error', message: 'Challenge not found' });
    challenge.status = req.body.status;
    await challenge.save();
    res.status(200).json({ status: 'success', data: challenge });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) return res.status(404).json({ status: 'error', message: 'Challenge not found' });
    res.status(200).json({ status: 'success', message: 'Challenge deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getChallengeParticipations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.employee_id) filter.employee_id = req.query.employee_id;
    if (req.query.challenge_id) filter.challenge_id = req.query.challenge_id;
    const participations = await ChallengeParticipation.find(filter)
      .populate('challenge_id', 'title xp')
      .populate('employee_id', 'name email');
    res.status(200).json({ status: 'success', count: participations.length, data: participations });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createChallengeParticipation = async (req, res) => {
  try {
    const participation = await ChallengeParticipation.create(req.body);
    const populated = await ChallengeParticipation.findById(participation._id)
      .populate('challenge_id', 'title xp')
      .populate('employee_id', 'name email');
    res.status(201).json({ status: 'success', data: populated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const decideChallengeParticipation = async (req, res) => {
  try {
    const participation = await ChallengeParticipation.findById(req.params.id);
    if (!participation) return res.status(404).json({ status: 'error', message: 'Participation not found' });
    const approve = Boolean(req.body.approve);
    if (approve) {
      participation.approval_status = 'approved';
      participation.xp_awarded = Number(req.body.xp_awarded || participation.xp_awarded || 0);
      await participation.save();
      if (participation.xp_awarded) {
        await User.findByIdAndUpdate(participation.employee_id, {
          $inc: { xp_total: participation.xp_awarded, points_balance: participation.xp_awarded },
        });
      }
    } else {
      participation.approval_status = 'rejected';
      await participation.save();
    }
    const populated = await ChallengeParticipation.findById(participation._id)
      .populate('challenge_id', 'title xp')
      .populate('employee_id', 'name email');
    res.status(200).json({ status: 'success', data: populated });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const filter = {};
    if (req.query.department_id) filter.department = req.query.department_id;
    const users = await User.find(filter).sort({ xp_total: -1 }).select('name xp_total points_balance department').populate('department', 'name');
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      employee_id: user._id,
      name: user.name,
      xp_total: user.xp_total || 0,
      points_balance: user.points_balance || 0,
      department: user.department?.name || null,
    }));
    res.status(200).json({ status: 'success', count: leaderboard.length, data: leaderboard });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
