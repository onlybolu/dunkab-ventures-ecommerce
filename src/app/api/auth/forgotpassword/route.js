import nodemailer from "nodemailer";
import User from "../../../../../models/user";
import dbConnect from "../../../../../lib/dbconnect";

const transporter = nodemailer.createTransport({
  service: "gmail", // easier than setting host/port manually
  auth: {
    user: process.env.EMAIL_USER, // your Gmail address
    pass: process.env.EMAIL_PASS, // your Gmail app password (not normal password!)
  },
});

export async function POST(req) {
  try {
    await dbConnect();

    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ message: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate unique OTP
    let otp;
    do {
      otp = Math.floor(100000 + Math.random() * 900000);
    } while (otp === user.otp?.code);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Update OTP in database
    const result = await User.updateOne(
      { email: email.toLowerCase().trim() },
      { $set: { "otp.code": otp, "otp.expiresAt": expiresAt } }
    );

    console.log("Matched docs:", result.matchedCount);
    console.log("Modified docs:", result.modifiedCount);

    const updatedUser = await User.findOne({ email: email.toLowerCase().trim() });
    console.log("Updated user document:", updatedUser);

    // Send OTP email
    const mailOptions = {
      from: `"Dunkab" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}\nThis OTP will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "OTP sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error in forgot password:", err);
    return new Response(JSON.stringify({ message: "Failed to send OTP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
