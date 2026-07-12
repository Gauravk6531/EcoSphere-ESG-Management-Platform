import mongoose from 'mongoose';

const esgPolicySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  document_url: { type: String, trim: true, default: '' },
  version: { type: String, trim: true, default: '1.0' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  department_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
}, { timestamps: true });

const ESGPolicy = mongoose.model('ESGPolicy', esgPolicySchema);
export default ESGPolicy;
