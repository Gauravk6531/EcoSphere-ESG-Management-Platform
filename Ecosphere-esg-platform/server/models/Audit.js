import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  auditor: { type: String, trim: true, default: '' },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  date: { type: Date, default: Date.now },
  findings_summary: { type: String, trim: true, default: '' },
}, { timestamps: true });

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;
