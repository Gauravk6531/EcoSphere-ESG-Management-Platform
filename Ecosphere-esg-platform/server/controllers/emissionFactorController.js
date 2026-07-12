import EmissionFactor from '../models/EmissionFactor.js';

export const getEmissionFactors = async (req, res) => {
  try {
    const factors = await EmissionFactor.find();
    res.status(200).json({ status: 'success', data: factors });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const createEmissionFactor = async (req, res) => {
  try {
    const factor = await EmissionFactor.create(req.body);
    res.status(201).json({ status: 'success', data: factor });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const updateEmissionFactor = async (req, res) => {
  try {
    const factor = await EmissionFactor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!factor) return res.status(404).json({ status: 'error', message: 'Emission factor not found' });
    res.status(200).json({ status: 'success', data: factor });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const deleteEmissionFactor = async (req, res) => {
  try {
    const factor = await EmissionFactor.findByIdAndDelete(req.params.id);
    if (!factor) return res.status(404).json({ status: 'error', message: 'Emission factor not found' });
    res.status(200).json({ status: 'success', message: 'Emission factor deleted' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
