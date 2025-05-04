import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignForm from "./components/SignForm";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignForm />} />
          <Route path="*" element={<LoginForm />} /> {/* Default to Login */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;