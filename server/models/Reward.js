import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  points_required: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;
