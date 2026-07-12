import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['csr_activity', 'challenge'], required: true },
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
