import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/VerifyEmail.css";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verifyEmail = async () => {
      const emailToken = searchParams.get("emailToken");

      if (!emailToken) {
        setStatus("Invalid or missing token.");
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/user/verify-email?emailToken=${emailToken}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          setStatus("Email verified successfully!");
        } else {
          const errorData = await response.json();
          setStatus(errorData.message || "Verification failed.");
        }
      } catch (error) {
        console.error("Error verifying email:", error);
        setStatus("An error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="verify-email-container">
      <h1>Email Verification</h1>
      <p>{status}</p>
    </div>
  );
};

export default VerifyEmail;