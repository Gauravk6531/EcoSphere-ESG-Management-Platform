import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Dashboard Pages
import Overview from './pages/dashboard/Overview';

// Environmental Pages
import EnvironmentalDashboard from './pages/environmental/EnvironmentalDashboard';
import CarbonTransactions from './pages/environmental/CarbonTransactions';
import EnvironmentalGoals from './pages/environmental/EnvironmentalGoals';
import EnvironmentalReports from './pages/environmental/EnvironmentalReports';
import MasterData from './pages/environmental/MasterData';

// Social, Governance, Gamification
import Social from './pages/social';
import Governance from './pages/governance';
import Gamification from './pages/gamification';

// Admin Pages
import AdminUsers from './pages/admin/AdminUsers';
import AdminDepartments from './pages/admin/AdminDepartments';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route index element={<Navigate to="login" replace />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Overview />} />

              {/* Environmental Module */}
              <Route path="environmental/dashboard" element={<EnvironmentalDashboard />} />
              <Route path="environmental/carbon-transactions" element={<CarbonTransactions />} />
              <Route path="environmental/goals" element={<EnvironmentalGoals />} />
              <Route path="environmental/reports" element={<EnvironmentalReports />} />
              <Route path="environmental/master-data" element={<MasterData />} />
              <Route path="social" element={<Social />} />
              <Route path="governance" element={<Governance />} />
              <Route path="gamification" element={<Gamification />} />
            </Route>
          </Route>

          {/* Admin-only Pages */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/departments" element={<AdminDepartments />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
