import express from 'express';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../controllers/goalController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();
router.route('/').get(protect, getGoals).post(protect, authorize('Admin', 'Manager'), createGoal);
router.route('/:id').put(protect, authorize('Admin', 'Manager'), updateGoal).delete(protect, authorize('Admin'), deleteGoal);
export default router;
