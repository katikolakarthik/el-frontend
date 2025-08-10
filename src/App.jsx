import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/admin/Dashboard';
import Students from './components/admin/Students';
import Assignments from './components/admin/Assignments';
import StudentDashboard from './components/student/StudentDashboard';
import StudentAssignments from './components/student/StudentAssignments';
import StudentProfile from './components/student/StudentProfile';
import ErrorBoundary from './components/ErrorBoundary';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = ['admin', 'user'] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={
              <ErrorBoundary>
                <Login />
              </ErrorBoundary>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <Layout />
              </AdminRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="students" element={
                <ErrorBoundary>
                  <Students />
                </ErrorBoundary>
              } />
              <Route path="assignments" element={
                <ErrorBoundary>
                  <Assignments />
                </ErrorBoundary>
              } />
            </Route>
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['user']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/student/dashboard" replace />} />
              <Route path="dashboard" element={
                <ErrorBoundary>
                  <StudentDashboard />
                </ErrorBoundary>
              } />
              <Route path="assignments" element={
                <ErrorBoundary>
                  <StudentAssignments />
                </ErrorBoundary>
              } />
              <Route path="profile" element={
                <ErrorBoundary>
                  <StudentProfile />
                </ErrorBoundary>
              } />
            </Route>
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
