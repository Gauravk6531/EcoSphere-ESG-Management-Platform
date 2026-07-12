const bcrypt = require("bcrypt");
const { Employee, Department, Category, Notification, ESGConfig, User } = require("../models");
const { getConfig } = require("../services/configService");
const { signToken } = require("../utils/jwt");
const { sanitizePayload } = require("../utils/sanitize");

const listEmployees = async (req, res) => res.json(await Employee.find());
const createEmployee = async (req, res) => res.status(201).json(await Employee.create(sanitizePayload(req.body)));
const getEmployee = async (req, res) => {
  const row = await Employee.findById(req.params.id);
  if (!row) return res.status(404).json({ detail: "Employee not found" });
  res.json(row);
};

const listDepartments = async (req, res) => {
  const departments = await Department.find();
  const rows = [];
  for (const department of departments) {
    const json = department.toJSON();
    json.employee_count = await Employee.countDocuments({ department_id: department.id });
    rows.push(json);
  }
  res.json(rows);
};
const createDepartment = async (req, res) => res.status(201).json(await Department.create(sanitizePayload(req.body)));
const updateDepartment = async (req, res) => {
  const row = await Department.findByIdAndUpdate(req.params.id, sanitizePayload(req.body), { new: true });
  if (!row) return res.status(404).json({ detail: "Department not found" });
  res.json(row);
};
const deleteDepartment = async (req, res) => {
  const row = await Department.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Department not found" });
  res.json({ ok: true });
};

const listCategories = async (req, res) => res.json(await Category.find());
const createCategory = async (req, res) => res.status(201).json(await Category.create(sanitizePayload(req.body)));
const deleteCategory = async (req, res) => {
  const row = await Category.findByIdAndDelete(req.params.id);
  if (!row) return res.status(404).json({ detail: "Category not found" });
  res.json({ ok: true });
};

const listNotifications = async (req, res) => {
  const filter = req.query.employee_id
    ? { $or: [{ employee_id: req.query.employee_id }, { employee_id: null }] }
    : {};
  res.json(await Notification.find(filter).sort({ created_at: -1 }).limit(100));
};
const markNotificationRead = async (req, res) => {
  const note = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!note) return res.status(404).json({ detail: "Notification not found" });
  res.json({ ok: true });
};

const getConfigEndpoint = async (req, res) => res.json(await getConfig());
const updateConfig = async (req, res) => {
  const row = await ESGConfig.findOneAndUpdate(
    { singleton: "main" },
    { $set: sanitizePayload(req.body), $setOnInsert: { singleton: "main" } },
    { upsert: true, new: true }
  );
  res.json(row);
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password_hash, role });
  res.status(201).json({ token: signToken({ id: user.id, email: user.email, role: user.role }), user });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ detail: "Invalid credentials" });
  }
  res.json({ token: signToken({ id: user.id, email: user.email, role: user.role }), user });
};

module.exports = {
  listEmployees,
  createEmployee,
  getEmployee,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listCategories,
  createCategory,
  deleteCategory,
  listNotifications,
  markNotificationRead,
  getConfigEndpoint,
  updateConfig,
  register,
  login,
};
