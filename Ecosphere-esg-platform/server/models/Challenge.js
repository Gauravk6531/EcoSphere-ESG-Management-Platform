import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  description: { type: String, trim: true, default: '' },
  xp: { type: Number, default: 0, min: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  evidence_required: { type: Boolean, default: false },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['draft', 'active', 'under_review', 'completed', 'archived'], default: 'draft' },
}, { timestamps: true });

const Challenge = mongoose.model('Challenge', challengeSchema);
export default Challenge;
