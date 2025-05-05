import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";
import "../styles/ForgotPass.css";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setAlert({ type: "error", message: "Please enter your email." });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/user/forgot-pass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: "success", message: "OTP sent to your email." });
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 2000);
      } else {
        setAlert({ type: "error", message: data.message || "Failed to send OTP." });
      }
    } catch (error) {
      console.error("Error during forgot password request:", error);
      setAlert({ 
        type: "error", 
        message: "Cannot connect to the server. Please try again later." 
      });
    }
  };

  return (
    <div className="forgot-pass-container">
      {alert.message && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: "", message: "" })}
          duration={5000}
        />
      )}
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
            Send OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPass;