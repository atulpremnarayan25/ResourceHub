import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleHomeRedirect } from './app/RouteGuards';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { TopicsPage } from './pages/TopicsPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { FacilitatorDashboardPage } from './pages/FacilitatorDashboardPage';
import { UploadResourcePage } from './pages/UploadResourcePage';
import { MyResourcesPage } from './pages/MyResourcesPage';
import { AdminTopicsPage } from './pages/AdminTopicsPage';
import { AdminFacilitatorsPage } from './pages/AdminFacilitatorsPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Core Layout Routes */}
          <Route element={<AppLayout />}>
            {/* Root smart redirect based on active role */}
            <Route path="/" element={<RoleHomeRedirect />} />

            {/* Student & Public Course Browsing */}
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/:topicId" element={<TopicDetailPage />} />

            {/* Access Denied Feedback Screen */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Facilitator Protected Section */}
            <Route
              path="/facilitator"
              element={
                <ProtectedRoute allowedRoles={['FACILITATOR', 'ADMIN']}>
                  <FacilitatorDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilitator/resources"
              element={
                <ProtectedRoute allowedRoles={['FACILITATOR', 'ADMIN']}>
                  <MyResourcesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilitator/resources/new"
              element={
                <ProtectedRoute allowedRoles={['FACILITATOR', 'ADMIN']}>
                  <UploadResourcePage />
                </ProtectedRoute>
              }
            />

            {/* Administrator Protected Section */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Navigate to="/admin/topics" replace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/topics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminTopicsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/facilitators"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminFacilitatorsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
