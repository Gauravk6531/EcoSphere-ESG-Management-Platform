import express from 'express';
import { getEmissionFactors, createEmissionFactor, updateEmissionFactor, deleteEmissionFactor } from '../controllers/emissionFactorController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();
router.route('/').get(protect, getEmissionFactors).post(protect, authorize('Admin'), createEmissionFactor);
router.route('/:id').put(protect, authorize('Admin'), updateEmissionFactor).delete(protect, authorize('Admin'), deleteEmissionFactor);
export default router;
