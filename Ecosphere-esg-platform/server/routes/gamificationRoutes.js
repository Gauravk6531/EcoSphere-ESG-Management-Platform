import express from 'express';
import {
  getBadges,
  createBadge,
  deleteBadge,
  getEmployeeBadges,
  getRewards,
  createReward,
  deleteReward,
  redeemReward,
  getRedemptions,
  getChallenges,
  createChallenge,
  updateChallengeStatus,
  deleteChallenge,
  getChallengeParticipations,
  createChallengeParticipation,
  decideChallengeParticipation,
  getLeaderboard,
} from '../controllers/gamificationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/badges', protect, getBadges);
router.post('/badges', protect, authorize('Admin', 'Manager'), createBadge);
router.delete('/badges/:id', protect, authorize('Admin', 'Manager'), deleteBadge);
router.get('/employees/:employeeId/badges', protect, getEmployeeBadges);

router.get('/rewards', protect, getRewards);
router.post('/rewards', protect, authorize('Admin', 'Manager'), createReward);
router.delete('/rewards/:id', protect, authorize('Admin', 'Manager'), deleteReward);
router.post('/rewards/redeem', protect, redeemReward);
router.get('/redemptions', protect, getRedemptions);

router.get('/challenges', protect, getChallenges);
router.post('/challenges', protect, authorize('Admin', 'Manager'), createChallenge);
router.put('/challenges/:id/status', protect, authorize('Admin', 'Manager'), updateChallengeStatus);
router.delete('/challenges/:id', protect, authorize('Admin', 'Manager'), deleteChallenge);

router.get('/challenge-participations', protect, getChallengeParticipations);
router.post('/challenge-participations', protect, createChallengeParticipation);
router.post('/challenge-participations/:id/decision', protect, authorize('Admin', 'Manager'), decideChallengeParticipation);

router.get('/leaderboard', protect, getLeaderboard);

export default router;
