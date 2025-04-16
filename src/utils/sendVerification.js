// utils/sendVerificationMail.js

import sendMail from "./sendMail.js";

const sendVerificationMail = async (email, emailToken) => {
  const html = `
    <p>Hello, verify your email address by clicking the link below:</p>
    <a href="http://localhost:5173/api/user/verify-email?emailToken=${emailToken}">
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
