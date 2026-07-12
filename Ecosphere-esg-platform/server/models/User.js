import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
  },
  password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
