import express from 'express';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getCarbonSummary } from '../controllers/carbonController.js';
import { protect, authorize } from '../middleware/auth.js';
const router = express.Router();
router.get('/summary', protect, getCarbonSummary);
router.route('/').get(protect, getTransactions).post(protect, createTransaction);
router.route('/:id').put(protect, authorize('Admin', 'Manager'), updateTransaction).delete(protect, authorize('Admin'), deleteTransaction);
export default router;
