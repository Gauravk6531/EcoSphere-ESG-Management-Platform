import mongoose from 'mongoose';

const environmentalGoalSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  targetValue: { type: Number, required: true, min: 0 },
  currentValue: { type: Number, default: 0, min: 0 },
  unit: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'Overdue'], default: 'Active' },
}, { timestamps: true });

const EnvironmentalGoal = mongoose.model('EnvironmentalGoal', environmentalGoalSchema);
export default EnvironmentalGoal;
