import mongoose from 'mongoose';

const employeeParticipationSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activity_id: { type: mongoose.Schema.Types.ObjectId, ref: 'CSRActivity', required: true },
  proof_url: { type: String, trim: true, default: '' },
  approval_status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'submitted' },
  points_earned: { type: Number, default: 0 },
  completion_date: { type: Date, default: Date.now },
}, { timestamps: true });

const EmployeeParticipation = mongoose.model('EmployeeParticipation', employeeParticipationSchema);
export default EmployeeParticipation;
