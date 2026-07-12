import express from 'express';
import {
  listActivities,
  createActivity,
  deleteActivity,
  listParticipations,
  createParticipation,
  decideParticipation,
  diversityMetrics,
  socialDashboard,
  listTrainingCompletions,
  createTrainingCompletion,
  updateTrainingCompletion,
  deleteTrainingCompletion,
} from '../controllers/socialController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/activities', protect, listActivities);
router.post('/activities', protect, authorize('Admin', 'Manager'), createActivity);
router.delete('/activities/:id', protect, authorize('Admin', 'Manager'), deleteActivity);

router.get('/participations', protect, listParticipations);
router.post('/participations', protect, createParticipation);
router.post('/participations/:id/decision', protect, authorize('Admin', 'Manager'), decideParticipation);

router.get('/diversity-metrics', protect, diversityMetrics);
router.get('/dashboard', protect, socialDashboard);

router.get('/training-completions', protect, listTrainingCompletions);
router.post('/training-completions', protect, authorize('Admin', 'Manager'), createTrainingCompletion);
router.put('/training-completions/:id', protect, authorize('Admin', 'Manager'), updateTrainingCompletion);
router.delete('/training-completions/:id', protect, authorize('Admin', 'Manager'), deleteTrainingCompletion);

export default router;
