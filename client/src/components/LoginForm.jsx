import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Alert from "./Alert";
import "../styles/LoginForm.css";

const LoginForm = () => {
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch("http://localhost:5000/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.data);
        setAlert({ type: "success", message: "Login successful! Redirecting..." });
        setTimeout(() => {
          if (data.data.role === "student") {
            navigate("/student");
          } else if (data.data.role === "instructor") {
            navigate("/instructor");
          } else {
            navigate("/");
          }
        }, 2000);
      } else {
        setAlert({ type: "error", message: data.message || "Login failed." });
      }
    } catch (error) {
      console.error("Error during login:", error);
      setAlert({ 
        type: "error", 
        message: "Cannot connect to the server. Please try again later." 
      });
    }
  };

  return (
    <div className="login-container">
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          duration={5000}
        />
      )}
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
