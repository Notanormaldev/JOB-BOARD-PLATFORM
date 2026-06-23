import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardCandidate from './pages/DashboardCandidate';
import DashboardEmployer from './pages/DashboardEmployer';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-background flex flex-col font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Candidate Dashboard */}
                <Route
                  path="/candidate"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <DashboardCandidate />
                    </ProtectedRoute>
                  }
                />

                {/* Employer Dashboard */}
                <Route
                  path="/employer"
                  element={
                    <ProtectedRoute allowedRoles={['employer']}>
                      <DashboardEmployer />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Dashboard */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DashboardAdmin />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
