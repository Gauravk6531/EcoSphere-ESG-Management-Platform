import ProductESGProfile from '../models/ProductESGProfile.js';

export const getProductProfiles = async (req, res) => {
  try {
    const profiles = await ProductESGProfile.find();
    res.status(200).json({ status: 'success', data: profiles });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const createProductProfile = async (req, res) => {
  try {
    const profile = await ProductESGProfile.create(req.body);
    res.status(201).json({ status: 'success', data: profile });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const updateProductProfile = async (req, res) => {
  try {
    const profile = await ProductESGProfile.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!profile) return res.status(404).json({ status: 'error', message: 'Product profile not found' });
    res.status(200).json({ status: 'success', data: profile });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const deleteProductProfile = async (req, res) => {
  try {
    const profile = await ProductESGProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
    res.status(200).json({ status: 'success', message: 'Product profile deleted' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
