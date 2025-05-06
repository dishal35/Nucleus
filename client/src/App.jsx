import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import StudentLandingPage from "./pages/StudentLandingPage";
import InstructorLandingPage from "./pages/InstructorLandingPage";
import TestButton from "./components/TestButton";
import LoginForm from "./components/LoginForm";
import SignForm from "./components/SignForm";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPass";
import "./App.css";
import VerifyEmail from "./components/verifyEmail";

// Protected route component for authenticated users
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Public route component for non-authenticated users
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    // Redirect based on user role
    if (user.role === "student") {
      return <Navigate to="/student" />;
    }
    if (user.role === "instructor") {
      return <Navigate to="/instructor" />;
    }
    return <Navigate to="/" />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignForm />
            </PublicRoute>
          } />
          <Route path="/forgot-password" element={
            <PublicRoute>
              <ForgotPass />
            </PublicRoute>
          } />
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPass />
            </PublicRoute>
          } />

          {/* Protected routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLandingPage />
            </ProtectedRoute>
          } />
          <Route path="/instructor" element={
            <ProtectedRoute allowedRoles={["instructor"]}>
              <>
                <InstructorLandingPage />
                <TestButton />
              </>
            </ProtectedRoute>
          } />
          <Route path="/verify-email" element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;