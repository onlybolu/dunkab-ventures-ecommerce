import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (email, name) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // You can use any SMTP (SendGrid, Mailgun, etc.)
    auth: {
      user: process.env.EMAIL_USER,      
      pass: process.env.EMAIL_PASS       
    }
  });

  const mailOptions = {
    from: `"Dunkab" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to Dunkab!",
    html: `<h3>Hello ${name},</h3><p>Welcome to dunkab! We're excited to have you on board.</p><a href="https://dunkab.com">Visit our site</a><p>Best regards,<br>Dunkab Team</p>`,
  };

  await transporter.sendMail(mailOptions);
};
