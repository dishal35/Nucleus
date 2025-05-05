import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Alert from "./Alert";
import "../styles/ResetPass.css";

const ResetPass = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!formData.otp || !formData.newPassword || !formData.confirmPassword) {
      setAlert({ type: "error", message: "Please fill in all fields." });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setAlert({ type: "error", message: "Passwords do not match." });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/reset-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp: formData.otp,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: "success", message: "Password reset successful!" });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setAlert({ type: "error", message: data.message || "Failed to reset password." });
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      setAlert({ 
        type: "error", 
        message: "Cannot connect to the server. Please try again later." 
      });
    }
  };

  return (
    <div className="reset-pass-container">
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          duration={5000}
        />
      )}
      <div className="reset-pass-card">
        <h1 className="reset-pass-title">Reset Password</h1>
        <form className="reset-pass-form" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter the OTP"
              value={formData.otp}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="reset-pass-button">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;