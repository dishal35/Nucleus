import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import ForgotPass from "./components/ForgotPass";
import ResetPass from "./components/ResetPass";
import SignForm from "./components/SignForm";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignForm />} />
        <Route path="/forgot-password" element={<ForgotPass />} />
        <Route path="/reset-password" element={<ResetPass />} />
        <Route path="*" element={<LoginForm />} /> {/* Default to Login */}
      </Routes>
    </Router>
  );
};

export default App;