import CarbonTransaction from '../models/CarbonTransaction.js';

export const getTransactions = async (req, res) => {
  try {
    const { departmentId, startDate, endDate, activityType } = req.query;
    const query = {};
    if (departmentId) query.department = departmentId;
    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }
    let txns = await CarbonTransaction.find(query)
      .populate('department', 'name code')
      .populate('emissionFactor', 'name activityType factor unit')
      .populate('loggedBy', 'name email')
      .sort({ transactionDate: -1 });
    if (activityType) txns = txns.filter(t => t.emissionFactor?.activityType === activityType);
    res.status(200).json({ status: 'success', count: txns.length, data: txns });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const createTransaction = async (req, res) => {
  try {
    const { transactionDate, description, departmentId, emissionFactorId, activityQuantity } = req.body;
    const txn = await CarbonTransaction.create({
      transactionDate, description, department: departmentId,
      emissionFactor: emissionFactorId, activityQuantity, loggedBy: req.user._id,
    });
    const populated = await CarbonTransaction.findById(txn._id)
      .populate('department', 'name code')
      .populate('emissionFactor', 'name activityType factor unit')
      .populate('loggedBy', 'name email');
    res.status(201).json({ status: 'success', data: populated });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const updateTransaction = async (req, res) => {
  try {
    const txn = await CarbonTransaction.findById(req.params.id);
    if (!txn) return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    Object.assign(txn, {
      transactionDate: req.body.transactionDate || txn.transactionDate,
      description: req.body.description || txn.description,
      department: req.body.departmentId || txn.department,
      emissionFactor: req.body.emissionFactorId || txn.emissionFactor,
      activityQuantity: req.body.activityQuantity ?? txn.activityQuantity,
    });
    const updated = await txn.save();
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const deleteTransaction = async (req, res) => {
  try {
    const txn = await CarbonTransaction.findByIdAndDelete(req.params.id);
    if (!txn) return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    res.status(200).json({ status: 'success', message: 'Transaction deleted' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const getCarbonSummary = async (req, res) => {
  try {
    const txns = await CarbonTransaction.find()
      .populate('emissionFactor', 'activityType')
      .populate('department', 'name');
    let totalEmissions = 0;
    const deptMap = {}, actMap = {}, monthMap = {};
    txns.forEach(t => {
      const e = t.carbonEmission || 0;
      totalEmissions += e;
      const dName = t.department?.name || 'Unknown';
      deptMap[dName] = (deptMap[dName] || 0) + e;
      const aType = t.emissionFactor?.activityType || 'Other';
      actMap[aType] = (actMap[aType] || 0) + e;
      const d = new Date(t.transactionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap[key] = (monthMap[key] || 0) + e;
    });
    const round = v => Math.round(v * 100) / 100;
    res.status(200).json({
      status: 'success',
      data: {
        totalEmissions: round(totalEmissions),
        transactionCount: txns.length,
        departmentBreakdown: Object.entries(deptMap).map(([name, value]) => ({ name, value: round(value) })),
        activityBreakdown: Object.entries(actMap).map(([name, value]) => ({ name, value: round(value) })),
        monthlyTrend: Object.entries(monthMap).sort().map(([month, emissions]) => ({ month, emissions: round(emissions) })),
      },
    });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
