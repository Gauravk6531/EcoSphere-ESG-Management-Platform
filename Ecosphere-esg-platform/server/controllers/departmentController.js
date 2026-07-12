import Department from '../models/Department.js';

export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find().populate('manager', 'name email');
    res.status(200).json({ status: 'success', data: depts });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, code, managerId, description } = req.body;
    if (await Department.findOne({ code: code?.toUpperCase() }))
      return res.status(400).json({ status: 'error', message: 'Department code already exists' });
    const dept = await Department.create({ name, code, manager: managerId || null, description });
    res.status(201).json({ status: 'success', data: dept });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ status: 'error', message: 'Department not found' });
    res.status(200).json({ status: 'success', data: dept });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ status: 'error', message: 'Department not found' });
    res.status(200).json({ status: 'success', message: 'Department deleted' });
  } catch (err) { res.status(500).json({ status: 'error', message: err.message }); }
};
