export const emailTemplates = {
  verificationEmail: (verificationLink) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 15px 32px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 16px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to Nucleus!</h2>
        <p>Thank you for signing up. Please verify your email address to get started.</p>
        <a href="${verificationLink}" class="button">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p>${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    </body>
    </html>
  `,

  enrollmentConfirmation: (courseName, instructorName) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .course-info {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Enrollment Confirmation</h2>
        <p>Congratulations! You have successfully enrolled in:</p>
        <div class="course-info">
          <h3>${courseName}</h3>
          <p>Instructor: ${instructorName}</p>
        </div>
        <p>You can now access all course materials and start learning.</p>
        <p>Happy learning!</p>
      </div>
    </body>
    </html>
  `,

  passwordReset: (otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container {
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .otp-box {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
          text-align: center;
          font-size: 24px;
          letter-spacing: 2px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Here is your OTP:</p>
        <div class="otp-box">
          <strong>${otp}</strong>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email or contact support if you're concerned.</p>
      </div>
    </body>
    </html>
  `
}; 