import User from "../../../../../models/user";
import { hashPassword } from "../../../../../lib/hash";
import dbConnect from "../../../../../lib/dbconnect";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if OTP exists and matches
    // Ensure otp is an object before accessing .code
    if (!user.otp || user.otp.code !== Number(otp)) {
      return new Response(JSON.stringify({ message: "Invalid OTP" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if OTP is expired
    if (new Date() > new Date(user.otp.expiresAt)) {
      return new Response(JSON.stringify({ message: "OTP expired" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Hash and update password, and REMOVE the entire otp field
    const hashedPassword = await hashPassword(newPassword);
    await User.findOneAndUpdate(
      { email: email },
      { 
        $set: { password: hashedPassword },
        $unset: { otp: 1 } // <-- This is the key change: remove the otp field
      }
    );

    return new Response(JSON.stringify({ message: "Password reset successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Failed to reset password" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}