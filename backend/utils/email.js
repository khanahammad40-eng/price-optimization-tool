const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, userName, token) => {
  const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify your email — Price Optimization Tool',
    html: `
      <h2>Hello ${userName},</h2>
      <p>Click the button below to verify your email address.</p>
      <a href="${verifyLink}"
         style="background:#00c896;color:#000;padding:12px 24px;
                border-radius:6px;text-decoration:none;font-weight:600;">
        Verify Email
      </a>
      <p>This link expires in 24 hours.</p>
      <p>If you didn't register, ignore this email.</p>
    `,
  });
};

module.exports = { sendVerificationEmail };