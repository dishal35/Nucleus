import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../styles/ForgotPass.css";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/forgot-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Password reset link sent to your email.");
        navigate("/reset-password", { state: { email } }); // Redirect to ResetPass with email
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to send reset link.");
      }
    } catch (error) {
      console.error("Error during forgot password request:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="forgot-pass-container">
      <div className="forgot-pass-card">
        <h1 className="forgot-pass-title">Forgot Password</h1>
        <form className="forgot-pass-form" onSubmit={handleForgotPassword}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button type="submit" className="forgot-pass-button">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPass;