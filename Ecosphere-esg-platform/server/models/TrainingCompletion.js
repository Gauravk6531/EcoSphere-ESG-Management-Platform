import mongoose from 'mongoose';

const trainingCompletionSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  training_name: { type: String, required: true, trim: true },
  provider: { type: String, trim: true, default: '' },
  due_date: { type: Date, default: null },
  completion_date: { type: Date, default: null },
  status: { type: String, enum: ['assigned', 'in_progress', 'completed', 'overdue'], default: 'assigned' },
  score: { type: Number, default: null },
  certificate_url: { type: String, trim: true, default: '' },
}, { timestamps: true });

const TrainingCompletion = mongoose.model('TrainingCompletion', trainingCompletionSchema);
export default TrainingCompletion;
