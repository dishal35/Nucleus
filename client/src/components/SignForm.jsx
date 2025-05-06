import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "./Alert";
import "../styles/SignupForm.css";

const SignForm = () => {
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student", // Default role
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id || e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.password) {
      setAlert({ type: "warning", message: "Please fill in all required fields." });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({ type: "warning", message: "Passwords do not match." });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server is not responding properly. Please try again later.");
      }

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: "success", message: "Signup successful! Redirecting to login..." });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setAlert({ type: "error", message: data.message || "Signup failed." });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      if (error.message.includes("Failed to fetch")) {
        setAlert({ 
          type: "error", 
          message: "Cannot connect to the server. Please make sure the server is running." 
        });
      } else {
        setAlert({ 
          type: "error", 
          message: error.message || "An error occurred. Please try again." 
        });
      }
    }
  };

  return (
    <div className="signup-container">
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          duration={5000}
        />
      )}
      <div className="signup-card">
        <h1 className="signup-title">Create an Account</h1>
        <form className="signup-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="role-select"
            >
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="signup-button">Sign Up</button>
        </form>
        <p className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignForm;
