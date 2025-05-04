import React from "react";
import { Link } from "react-router-dom";  // Added import
import "../styles/LoginForm.css";

const handleLogin = async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5000/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Login successful:", data);
      // Redirect or perform any other action on successful login
    } else {
      console.error("Login failed:", response.statusText);
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
};

const handleGoogleLogin = () => {
  // Redirect to the backend route for Google OAuth
  window.location.href = "http://localhost:5000/api/auth/google";
};


const LoginForm = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" />
          </div>
          <button type="submit" className="login-button" onClick={handleLogin}>
            Login
          </button>
        </form>
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        <p className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <div className="social-login">
          <button className="google-button" onClick={handleGoogleLogin}>
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
