import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';
import Department from '../models/Department.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// @desc Register
// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, roleName, departmentId } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ status: 'error', message: 'Email already registered' });

    let role = await Role.findOne({ name: roleName || 'Employee' });
    if (!role) role = await Role.findOne({ name: 'Employee' });

    const user = await User.create({ name, email, password, role: role._id, department: departmentId || null });
    const populated = await User.findById(user._id).populate('role').populate('department');

    res.status(201).json({
      status: 'success',
      data: { _id: populated._id, name: populated.name, email: populated.email, role: populated.role, department: populated.department, token: generateToken(populated._id) },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc Login
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });

    const populated = await User.findById(user._id).populate('role').populate('department');
    res.status(200).json({
      status: 'success',
      data: { _id: populated._id, name: populated.name, email: populated.email, role: populated.role, department: populated.department, token: generateToken(populated._id) },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc Get me
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ status: 'success', data: req.user });
};

// @desc Get all users (Admin only)
// @route GET /api/auth/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('role').populate('department');
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc Update a user (Admin only)
// @route PUT /api/auth/users/:id
export const updateUser = async (req, res) => {
  try {
    const { roleName, departmentId } = req.body;
    const updateData = {};
    if (roleName) {
      const role = await Role.findOne({ name: roleName });
      if (!role) return res.status(400).json({ status: 'error', message: 'Invalid role name' });
      updateData.role = role._id;
    }
    if (departmentId) {
      updateData.department = departmentId;
    }
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('role').populate('department');
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc Delete a user (Admin only)
// @route DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.status(200).json({ status: 'success', message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
