import express from 'express';
import { getProductProfiles, createProductProfile, updateProductProfile, deleteProductProfile } from '../controllers/productESGController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();
router.route('/').get(protect, getProductProfiles).post(protect, authorize('Admin', 'Manager'), createProductProfile);
router.route('/:id').put(protect, authorize('Admin', 'Manager'), updateProductProfile).delete(protect, authorize('Admin'), deleteProductProfile);
export default router;
