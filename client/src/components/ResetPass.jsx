import React, { useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import "../styles/ResetPass.css";

const ResetPass = () => {
  const location = useLocation(); // Get location state
  const email = location.state?.email || ""; // Extract email from state

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/reset-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });

      if (response.ok) {
        alert("Password reset successful!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="reset-pass-container">
      <div className="reset-pass-card">
        <h1 className="reset-pass-title">Reset Password</h1>
        <form className="reset-pass-form" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter the OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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