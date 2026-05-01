const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // simple & stable
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send Email Function
const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"Clinic App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email error:", error);
    return false;
  }
};

module.exports = sendEmail;