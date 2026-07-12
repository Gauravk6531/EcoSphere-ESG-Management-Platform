import mongoose from 'mongoose';

const policyAcknowledgementSchema = new mongoose.Schema({
  policy_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ESGPolicy', required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acknowledged_date: { type: Date, default: null },
  reminder_sent: { type: Boolean, default: false },
}, { timestamps: true });

const PolicyAcknowledgement = mongoose.model('PolicyAcknowledgement', policyAcknowledgementSchema);
export default PolicyAcknowledgement;
