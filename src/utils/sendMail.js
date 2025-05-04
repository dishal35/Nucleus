// utils/sendMail.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const GMAIL_PASS = process.env.GMAIL_PASS;

const sendMail = async ({ email, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "dishalohia.is22@bmsce.ac.in",
      pass: GMAIL_PASS,
    },
    
  }
);

  const mailOptions = {
    from: "dishalohia.is22@bmsce.ac.in",
    to: email,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export default sendMail;
