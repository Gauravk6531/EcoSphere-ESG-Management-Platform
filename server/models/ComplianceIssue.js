import mongoose from 'mongoose';

const complianceIssueSchema = new mongoose.Schema({
  audit_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Audit', default: null },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  description: { type: String, trim: true, default: '' },
  owner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  due_date: { type: Date, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
}, { timestamps: true });

complianceIssueSchema.virtual('is_overdue').get(function () {
  return !['resolved', 'closed'].includes(this.status) && this.due_date && this.due_date < new Date();
});

const ComplianceIssue = mongoose.model('ComplianceIssue', complianceIssueSchema);
export default ComplianceIssue;
