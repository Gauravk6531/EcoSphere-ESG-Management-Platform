import mongoose from 'mongoose';

// Employee profile linked to User (extends User with ESG-specific fields)
const employeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  is_department_head: { type: Boolean, default: false },
  xp_total: { type: Number, default: 0 },
  points_balance: { type: Number, default: 0 },
  employee_code: { type: String, trim: true, default: '' },
}, { timestamps: true });

employeeSchema.virtual('name').get(function () { return this.user?.name; });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
