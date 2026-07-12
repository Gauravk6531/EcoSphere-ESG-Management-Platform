import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  unlock_metric: { type: String, enum: ['xp_total', 'completed_challenges', 'csr_participations'], required: true },
  unlock_comparator: { type: String, enum: ['>=', '>', '=='], default: '>=' },
  unlock_threshold: { type: Number, required: true, min: 0 },
  icon: { type: String, trim: true, default: '' },
}, { timestamps: true });

const Badge = mongoose.model('Badge', badgeSchema);
export default Badge;
