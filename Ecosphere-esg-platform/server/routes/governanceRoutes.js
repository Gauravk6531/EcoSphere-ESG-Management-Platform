import express from 'express';
import {
  getPolicies,
  createPolicy,
  deletePolicy,
  getAcknowledgements,
  acknowledgePolicy,
  sendReminder,
  getAudits,
  createAudit,
  deleteAudit,
  getComplianceIssues,
  createComplianceIssue,
  updateComplianceIssue,
  getOverdueIssues,
} from '../controllers/governanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/policies', protect, getPolicies);
router.post('/policies', protect, authorize('Admin', 'Manager'), createPolicy);
router.delete('/policies/:id', protect, authorize('Admin', 'Manager'), deletePolicy);

router.get('/acknowledgements', protect, getAcknowledgements);
router.post('/acknowledgements', protect, acknowledgePolicy);
router.post('/acknowledgements/:id/send-reminder', protect, authorize('Admin', 'Manager'), sendReminder);

router.get('/audits', protect, getAudits);
router.post('/audits', protect, authorize('Admin', 'Manager'), createAudit);
router.delete('/audits/:id', protect, authorize('Admin', 'Manager'), deleteAudit);

router.get('/compliance-issues', protect, getComplianceIssues);
router.post('/compliance-issues', protect, createComplianceIssue);
router.put('/compliance-issues/:id', protect, authorize('Admin', 'Manager'), updateComplianceIssue);
router.get('/compliance-issues/overdue', protect, getOverdueIssues);

export default router;
