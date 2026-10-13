import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import StudentLogin from './pages/StudentLogin';
import StudentRegister from './pages/StudentRegister';
import AdminLogin from './pages/AdminLogin';

import StudentLayout from './components/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';
import ExamTaking from './pages/ExamTaking';
import ResultPage from './pages/ResultPage';
import StudentHistory from './pages/StudentHistory';
import StudentProfile from './pages/StudentProfile';

import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminExams from './pages/AdminExams';
import AdminQuestions from './pages/AdminQuestions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminStudents from './pages/AdminStudents';
import AdminLogs from './pages/AdminLogs';

function StudentProtectedRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading session...</div>;
  if (!user || role !== 'STUDENT') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminProtectedRoute({ children }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading session...</div>;
  if (!user || role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/register" element={<StudentRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Student Protected Routes */}
          <Route element={<StudentProtectedRoute><StudentLayout /></StudentProtectedRoute>}>
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/history" element={<StudentHistory />} />
            <Route path="/result/:attemptId" element={<ResultPage />} />
            <Route path="/profile" element={<StudentProfile />} />
          </Route>

          {/* Dedicated Exam Taking Route (No distracting navbar) */}
          <Route
            path="/exam/:examId/take"
            element={
              <StudentProtectedRoute>
                <ExamTaking />
              </StudentProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="exams/:examId/questions" element={<AdminQuestions />} />
            <Route path="exams/:examId/analytics" element={<AdminAnalytics />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
