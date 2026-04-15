import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("❌ Authentication failed:", error);
  } else {
    console.log("✅ Server is ready to take our messages!");
  }
});
