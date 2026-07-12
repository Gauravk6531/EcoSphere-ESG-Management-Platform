import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

// Routes
import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import emissionFactorRoutes from './routes/emissionFactorRoutes.js';
import productESGRoutes from './routes/productESGRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import carbonRoutes from './routes/carbonRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import governanceRoutes from './routes/governanceRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigins = [process.env.CORS_ORIGIN || 'http://localhost:5173', 'http://localhost:5177'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/emission-factors', emissionFactorRoutes);
app.use('/api/product-esg', productESGRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'EcoSphere ESG API is running', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
