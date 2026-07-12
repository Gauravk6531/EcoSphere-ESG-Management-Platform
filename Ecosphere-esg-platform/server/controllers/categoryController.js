import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    const categories = await Category.find(filter);
    res.status(200).json({ status: 'success', count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ status: 'success', data: category });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ status: 'error', message: 'Category not found' });
    res.status(200).json({ status: 'success', message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
