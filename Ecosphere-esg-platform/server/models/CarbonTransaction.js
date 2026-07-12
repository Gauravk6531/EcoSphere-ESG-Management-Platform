import mongoose from 'mongoose';

const carbonTransactionSchema = new mongoose.Schema({
  transactionDate: { type: Date, required: true, default: Date.now },
  description: { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  emissionFactor: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionFactor', required: true },
  activityQuantity: { type: Number, required: true, min: 0 },
  carbonEmission: { type: Number, default: 0 }, // Auto-calculated in pre-save
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Auto-calculate carbon emission before saving
carbonTransactionSchema.pre('save', async function (next) {
  try {
    const EmissionFactor = mongoose.model('EmissionFactor');
    const factor = await EmissionFactor.findById(this.emissionFactor);
    if (!factor) return next(new Error('Emission factor not found'));
    this.carbonEmission = Math.round(this.activityQuantity * factor.factor * 10000) / 10000;
    next();
  } catch (err) {
    next(err);
  }
});

const CarbonTransaction = mongoose.model('CarbonTransaction', carbonTransactionSchema);
export default CarbonTransaction;
