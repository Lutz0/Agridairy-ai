import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MilkYard from './pages/MilkYard';
import CattleManagement from './pages/CattleManagement';
import HealthMonitoring from './pages/HealthMonitoring';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import UserManagement from './pages/UserManagement';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/cart" element={<Cart />} />

            {/* Protected Routes with Sidebar Layout */}
            <Route element={<Layout />}>
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute roles={['farmer', 'admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/milk-yard" 
                element={
                  <ProtectedRoute roles={['farmer', 'admin']}>
                    <MilkYard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cattle" 
                element={
                  <ProtectedRoute roles={['farmer', 'admin']}>
                    <CattleManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/health" 
                element={
                  <ProtectedRoute roles={['farmer', 'admin']}>
                    <HealthMonitoring />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute roles={['buyer', 'admin']}>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute roles={['admin']}>
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
