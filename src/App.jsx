import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleHomeRedirect } from './app/RouteGuards';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/common/UIFeedback';

// Core Public Pages (bundled for immediate initial paint)
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { TopicsPage } from './pages/TopicsPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Code-Split Protected Sections (lazy-loaded on demand)
const FacilitatorDashboardPage = lazy(() =>
  import('./pages/FacilitatorDashboardPage').then((m) => ({ default: m.FacilitatorDashboardPage }))
);
const UploadResourcePage = lazy(() =>
  import('./pages/UploadResourcePage').then((m) => ({ default: m.UploadResourcePage }))
);
const MyResourcesPage = lazy(() =>
  import('./pages/MyResourcesPage').then((m) => ({ default: m.MyResourcesPage }))
);
const AdminTopicsPage = lazy(() =>
  import('./pages/AdminTopicsPage').then((m) => ({ default: m.AdminTopicsPage }))
);
const AdminFacilitatorsPage = lazy(() =>
  import('./pages/AdminFacilitatorsPage').then((m) => ({ default: m.AdminFacilitatorsPage }))
);

const PageFallback = () => (
  <div className="container" style={{ padding: 'var(--space-12) 0' }}>
    <LoadingSpinner text="Loading section..." />
  </div>
);

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
                  <Suspense fallback={<PageFallback />}>
                    <FacilitatorDashboardPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilitator/resources"
              element={
                <ProtectedRoute allowedRoles={['FACILITATOR', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}>
                    <MyResourcesPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilitator/resources/new"
              element={
                <ProtectedRoute allowedRoles={['FACILITATOR', 'ADMIN']}>
                  <Suspense fallback={<PageFallback />}>
                    <UploadResourcePage />
                  </Suspense>
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
                  <Suspense fallback={<PageFallback />}>
                    <AdminTopicsPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/facilitators"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Suspense fallback={<PageFallback />}>
                    <AdminFacilitatorsPage />
                  </Suspense>
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
