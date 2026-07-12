import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).populate('role').populate('department');
      if (!req.user) return res.status(401).json({ status: 'error', message: 'User not found' });
      next();
    } catch (error) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, invalid token' });
    }
  } else {
    return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  const userRole = req.user?.role?.name;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({
      status: 'error',
      message: `Role '${userRole}' is not allowed to access this resource`,
    });
  }
  next();
};
