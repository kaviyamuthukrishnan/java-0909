import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from './components/common/ToastContainer';
import { AppProvider } from './contexts/AppContext';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminComplaintsPage } from './pages/admin/AdminComplaintsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminMonitoringPage } from './pages/admin/AdminMonitoringPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminVerificationsPage } from './pages/admin/AdminVerificationsPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterNgoPage } from './pages/auth/RegisterNgoPage';
import { RegisterProviderPage } from './pages/auth/RegisterProviderPage';
import { VerifyAccountPage } from './pages/auth/VerifyAccountPage';
import { NgoAvailableDonationsPage } from './pages/ngo/NgoAvailableDonationsPage';
import { NgoCollectionsPage } from './pages/ngo/NgoCollectionsPage';
import { NgoDashboard } from './pages/ngo/NgoDashboard';
import { NgoProfilePage } from './pages/ngo/NgoProfilePage';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderDonatePage } from './pages/provider/ProviderDonatePage';
import { ProviderDonationsPage } from './pages/provider/ProviderDonationsPage';
import { ProviderInventoryPage } from './pages/provider/ProviderInventoryPage';
import { ProviderPredictionPage } from './pages/provider/ProviderPredictionPage';
import { ProviderProfilePage } from './pages/provider/ProviderProfilePage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { FoodSafetyPage } from './pages/public/FoodSafetyPage';
import { HomePage } from './pages/public/HomePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { CommunicationCenterPage } from './pages/shared/CommunicationCenterPage';
import { DonationTrackingPage } from './pages/shared/DonationTrackingPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/food-safety" element={<FoodSafetyPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/provider" element={<RegisterProviderPage />} />
          <Route path="/register/ngo" element={<RegisterNgoPage />} />
          <Route path="/verify-account" element={<VerifyAccountPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Food Provider Portal */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/inventory"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/prediction"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderPredictionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/donate"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderDonatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/donations"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderDonationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/profile"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER']}>
                <ProviderProfilePage />
              </ProtectedRoute>
            }
          />

          {/* NGO Portal */}
          <Route
            path="/ngo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/available"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoAvailableDonationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/collections"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoCollectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/profile"
            element={
              <ProtectedRoute allowedRoles={['NGO']}>
                <NgoProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Administrator Portal */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/verifications"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminVerificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/monitoring"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMonitoringPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminComplaintsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Shared Protected Modules */}
          <Route
            path="/portal/tracking"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER', 'NGO', 'ADMIN']}>
                <DonationTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/messages"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER', 'NGO', 'ADMIN']}>
                <CommunicationCenterPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AppProvider>
  );
}
