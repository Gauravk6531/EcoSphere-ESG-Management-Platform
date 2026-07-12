import mongoose from 'mongoose';

const challengeParticipationSchema = new mongoose.Schema({
  challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  proof_url: { type: String, trim: true, default: '' },
  approval_status: { type: String, enum: ['draft', 'submitted', 'approved', 'rejected'], default: 'submitted' },
  xp_awarded: { type: Number, default: 0 },
}, { timestamps: true });

const ChallengeParticipation = mongoose.model('ChallengeParticipation', challengeParticipationSchema);
export default ChallengeParticipation;
