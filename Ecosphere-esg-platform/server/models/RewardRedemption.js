import mongoose from 'mongoose';

const rewardRedemptionSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reward_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  points_deducted: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);
export default RewardRedemption;
