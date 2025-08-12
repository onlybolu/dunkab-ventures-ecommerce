import nodemailer from "nodemailer";
import User from "../../../../../models/user";
import dbConnect from "../../../../../lib/dbconnect";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req) {
  try {
    await dbConnect()
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let otp;
do {
  otp = Math.floor(100000 + Math.random() * 900000);
} while (otp === user.otp?.code);

const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes
await User.findOneAndUpdate({ email: email }, { $set: { otp: { code: otp, expiresAt: expiresAt } } });
const result = await User.updateOne(
    { email: email.toLowerCase().trim() }, // normalize casing/spaces
    { $set: { "otp.code": otp, "otp.expiresAt": expiresAt } }
  );
  
  console.log("Matched docs:", result.matchedCount);
  console.log("Modified docs:", result.modifiedCount);
  console.log("Acknowledged:", result.acknowledged);
  
  // Optional: verify document after update
  const updatedUser = await User.findOne({ email: email.toLowerCase().trim() });
  console.log("Updated user document:", updatedUser);
  

    const mailOptions = {
      from: `"Dunkab" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ message: "OTP sent successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to send OTP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}