import mongoose from 'mongoose';

const csrActivitySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  date: { type: Date, default: Date.now },
  description: { type: String, trim: true, default: '' },
  evidence_required: { type: Boolean, default: false },
}, { timestamps: true });

const CSRActivity = mongoose.model('CSRActivity', csrActivitySchema);
export default CSRActivity;
