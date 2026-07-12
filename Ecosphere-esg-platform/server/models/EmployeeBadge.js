import mongoose from 'mongoose';

const employeeBadgeSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  awarded_date: { type: Date, default: Date.now },
}, { timestamps: true });

employeeBadgeSchema.index({ employee_id: 1, badge_id: 1 }, { unique: true });

const EmployeeBadge = mongoose.model('EmployeeBadge', employeeBadgeSchema);
export default EmployeeBadge;
