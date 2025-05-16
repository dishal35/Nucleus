// utils/sendMail.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const GMAIL_PASS = process.env.GMAIL_PASS;
const GMAIL_USER = process.env.GMAIL_USER || "dishalohia.is22@bmsce.ac.in";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
    // Add TLS options for security
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2"
    }
  });
};

const sendMail = async ({ email, subject, html }) => {
  // Input validation
  if (!email || !subject || !html) {
    throw new Error("Missing required email parameters");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: {
      name: "Nucleus Learning",
      address: GMAIL_USER
    },
    to: email,
    subject,
    html,
    // Add headers for better deliverability
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  };

  try {
    // Verify transporter configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log("📧 Email sent successfully:", {
      messageId: info.messageId,
      to: email,
      subject,
      response: info.response
    });

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", {
      to: email,
      subject,
      error: error.message,
      stack: error.stack
    });

    // Rethrow error for proper handling in consumer
    throw new Error(`Failed to send email: ${error.message}`);
  } finally {
    // Close transporter connection
    transporter.close();
  }
};

export default sendMail;
