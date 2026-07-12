const {
  EmissionFactor,
  CarbonTransaction,
  EnvironmentalGoal,
  ProductESGProfile,
} = require("../models");
const { sanitizePayload } = require("../utils/sanitize");

const listEmissionFactors = async (req, res) => res.json(await EmissionFactor.find());
const createEmissionFactor = async (req, res) => res.status(201).json(await EmissionFactor.create(sanitizePayload(req.body)));
const deleteEmissionFactor = async (req, res) => {
  const row = await EmissionFactor.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Emission factor not found" });
  res.json({ ok: true });
};

const listCarbonTransactions = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  res.json(await CarbonTransaction.find(filter));
};
const createCarbonTransaction = async (req, res) => {
  const payload = sanitizePayload(req.body);
  if (payload.emission_factor_id && payload.quantity) {
    const factor = await EmissionFactor.findById(payload.emission_factor_id);
    if (factor) payload.co2e_calculated = Math.round(Number(payload.quantity) * factor.co2e_value * 100) / 100;
  }
  res.status(201).json(await CarbonTransaction.create(payload));
};

const listGoals = async (req, res) => {
  const filter = req.query.department_id ? { department_id: req.query.department_id } : {};
  res.json(await EnvironmentalGoal.find(filter));
};
const createGoal = async (req, res) => res.status(201).json(await EnvironmentalGoal.create(sanitizePayload(req.body)));
const updateGoal = async (req, res) => {
  const row = await EnvironmentalGoal.findByIdAndUpdate(req.params.id, sanitizePayload(req.body), { new: true });
  if (!row) return res.status(404).json({ detail: "Goal not found" });
  res.json(row);
};
const deleteGoal = async (req, res) => {
  const row = await EnvironmentalGoal.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Goal not found" });
  res.json({ ok: true });
};

const listProductProfiles = async (req, res) => res.json(await ProductESGProfile.find());
const createProductProfile = async (req, res) => res.status(201).json(await ProductESGProfile.create(sanitizePayload(req.body)));

module.exports = {
  listEmissionFactors,
  createEmissionFactor,
  deleteEmissionFactor,
  listCarbonTransactions,
  createCarbonTransaction,
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  listProductProfiles,
  createProductProfile,
};
