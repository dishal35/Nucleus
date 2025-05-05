import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import InstructorDashboard from "./components/Dashboard/InstructorDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import LoginForm from "./components/LoginForm";
import SignForm from "./components/SignForm";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPass";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignForm />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password" element={<ResetPass />} />
        <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="*" element={<LandingPage />} /> {/* Default to Landing Page */}
      </Routes>
    </Router>
  );
};

export default App;