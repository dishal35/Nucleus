// utils/sendOtpMail.js

import sendMail from "./sendMail.js";

const sendOtpMail = async (email, otp) => {
  const html = `
    <p>Your OTP is:</p>
    <h2>${otp}</h2>
    <p>This OTP is valid for 10 minutes.</p>
  `;

  await sendMail({
    email,
    subject: "Your OTP Code",
    html,
  });
};

export default sendOtpMail;
