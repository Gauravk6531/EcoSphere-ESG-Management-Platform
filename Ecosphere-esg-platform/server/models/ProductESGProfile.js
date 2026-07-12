import mongoose from 'mongoose';

const productESGProfileSchema = new mongoose.Schema({
  productName: { type: String, required: true, trim: true },
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  materialComposition: [{
    materialName: { type: String, required: true },
    weightKg: { type: Number, required: true, min: 0 },
  }],
  carbonFootprint: { type: Number, required: true, default: 0, min: 0 },
  socialRiskScore: { type: Number, required: true, min: 0, max: 100, default: 50 },
  governanceRating: {
    type: String,
    required: true,
    enum: ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC'],
    default: 'BBB',
  },
}, { timestamps: true });

const ProductESGProfile = mongoose.model('ProductESGProfile', productESGProfileSchema);
export default ProductESGProfile;
