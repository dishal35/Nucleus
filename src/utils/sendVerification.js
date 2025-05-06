// utils/sendVerificationMail.js

import sendMail from "./sendMail.js";

const sendVerificationMail = async (email, emailToken) => {
  // Correct frontend URL for verification
  const verificationLink = `http://localhost:3000/verify-email?emailToken=${emailToken}`;

  const html = `
    <p>Hello, verify your email address by clicking the link below:</p>
    <a href="${verificationLink}">
      Click here to verify
    </a>
  `;

  await sendMail({
    email,
    subject: "Please verify your email...",
    html,
  });
};

export default sendVerificationMail;
