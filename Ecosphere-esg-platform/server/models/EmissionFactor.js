import mongoose from 'mongoose';

const emissionFactorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  activityType: {
    type: String,
    required: true,
    enum: ['Energy', 'Fuel', 'Travel', 'Waste', 'Water', 'Other'],
    default: 'Energy',
  },
  factor: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
}, { timestamps: true });

const EmissionFactor = mongoose.model('EmissionFactor', emissionFactorSchema);
export default EmissionFactor;
