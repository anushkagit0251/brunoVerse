import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PetOwnerDashboard from './pages/dashboards/PetOwnerDashboard';
import RescuerDashboard from './pages/dashboards/RescuerDashboard';
import VeterinarianDashboard from './pages/dashboards/VeterinarianDashboard';
import NgoDashboard from './pages/dashboards/NgoDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import MyPetsPage from './pages/MyPetsPage';
import RescueCasesPage from './pages/RescueCasesPage';
import CommunityPage from './pages/CommunityPage';
import ProfilePage from './pages/ProfilePage';

import WelcomePage from './pages/WelcomePage';
import LearningPage from './pages/LearningPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import NearbyHelpPage from './pages/NearbyHelpPage';

// Protected Route wrapper
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)', color: 'var(--primary)', fontWeight: 700 }}>
        Loading BrunoVerse...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Automatic dashboard redirect based on role
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/welcome" replace />;

  switch (user.role) {
    case 'RESCUER':
      return <Navigate to="/dashboard/rescuer" replace />;
    case 'VETERINARIAN':
      return <Navigate to="/dashboard/veterinarian" replace />;
    case 'NGO':
      return <Navigate to="/dashboard/ngo" replace />;
    case 'VOLUNTEER':
      return <Navigate to="/dashboard/volunteer" replace />;
    case 'PET_OWNER':
    default:
      return <Navigate to="/dashboard/owner" replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardRedirect />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            
            {/* Role Dashboards */}
            <Route path="/dashboard/owner" element={<PetOwnerDashboard />} />
            <Route path="/dashboard/rescuer" element={<RescuerDashboard />} />
            <Route path="/dashboard/veterinarian" element={<VeterinarianDashboard />} />
            <Route path="/dashboard/ngo" element={<NgoDashboard />} />
            <Route path="/dashboard/volunteer" element={<VolunteerDashboard />} />

            {/* Feature Sub-pages */}
            <Route path="/pets" element={<MyPetsPage />} />
            <Route path="/cases" element={<RescueCasesPage />} />
            <Route path="/rescues" element={<RescueCasesPage />} />
            <Route path="/my-rescues" element={<RescueCasesPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<ProfilePage />} />
            <Route path="/help" element={<NearbyHelpPage />} />
            <Route path="/nearby-help" element={<NearbyHelpPage />} />
            <Route path="/veterinary" element={<NearbyHelpPage />} />
            <Route path="/vets-ngos" element={<NearbyHelpPage />} />
            <Route path="/messages" element={<RescuerDashboard />} />
            <Route path="/reports" element={<RescueCasesPage />} />
            <Route path="/consultations" element={<VeterinarianDashboard />} />
            <Route path="/volunteers" element={<NgoDashboard />} />
          </Route>

          {/* Catch-all sends to welcome */}
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
