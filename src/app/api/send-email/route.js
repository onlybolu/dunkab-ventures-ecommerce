import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { email, subject, text, html } = req.body;

  if (!email || !subject || !text) {
    return res.status(400).json({ success: false, message: 'Missing required fields: email, subject, or text' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the email.
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      text: text,
      html: html,
    });

    console.log('Message sent: %s', info.messageId);

    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email' });
  }
}