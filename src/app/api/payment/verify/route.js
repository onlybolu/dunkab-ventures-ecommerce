// src/app/api/payment/verify/route.js

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "../../../../../lib/dbconnect";
import Order from "../../../../../models/Order";
import Payment from "../../../../../models/Payment";
import Cart from "../../../../../models/cart"; 
import nodemailer from "nodemailer"; // Import nodemailer

export async function GET(request) {
  await dbConnect();

  const headersList = headers();
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const host = headersList.get("host");
  const baseUrl = `${protocol}://${host}`;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const transactionId = url.searchParams.get("transaction_id");
  const orderId = url.searchParams.get("orderId");

  console.log("Redirected to verify endpoint.");
  console.log("URL Params:", { status, transactionId, orderId });

  if (!orderId || !transactionId) {
    console.error("Missing orderId or transactionId in URL params.");
    return NextResponse.redirect(`${baseUrl}/status?status=failed`);
  }

  let paymentStatus = "failed";
  let orderStatus = "cancelled";
  let orderDetails = null;

  try {
    if (status === "successful" || status === "completed") {
      console.log("Initial status is successful. Verifying transaction...");

      const flutterRes = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` },
      });

      console.log("Flutterwave verification response status:", flutterRes.status);
      const flutterData = await flutterRes.json();
      console.log("Flutterwave verification response data:", JSON.stringify(flutterData, null, 2));

      if (flutterData.status === "success" && flutterData.data.status === "successful") {
        console.log("Payment verification succeeded.");
        paymentStatus = "successful";
        orderStatus = "pending";

        orderDetails = await Order.findById(orderId);
        if (!orderDetails) {
            console.error("Order details not found for orderId:", orderId);
        } else {
            await Payment.create({
                userId: orderDetails.user,
                orderId: orderId,
                amount: flutterData.data.amount,
                paymentMethod: flutterData.data.payment_type,
                transactionId: transactionId,
                status: "successful",
            });

            // --- NEW LOGIC: Clear user's cart in the database after successful payment ---
            console.log(`Clearing cart for user: ${orderDetails.user}`);
            // Assuming your Cart model stores cart items for a user,
            // or if the cart is directly on the User model, update it there.
            // Replace 'Cart' and its methods with your actual cart storage logic.
            // Example if cart is a separate collection linked by userId:
            await Cart.findOneAndUpdate(
                { userId: orderDetails.user },
                { $set: { items: [] } },
                { upsert: true } // Create cart if it doesn't exist, then clear
            );
            // If your cart is directly on the User model (like in your CartProvider example),
            // you'd do something like:
            // await User.findByIdAndUpdate(orderDetails.user, { $set: { cart: [] } });
            // Make sure to import your User model if you go this route.
            // --- END NEW LOGIC ---
        }
      } else {
        console.error("Payment verification failed based on Flutterwave's response.");
      }
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: paymentStatus, orderStatus: orderStatus },
      { new: true }
    );

    if (updatedOrder && paymentStatus === "successful" && orderDetails) {
        console.log("Conditions met for email sending. Initializing Nodemailer transporter...");
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

            console.log("Transporter created. Preparing email content...");

            const userEmail = orderDetails.deliveryInfo.email;
            const orderMethod = orderDetails.method;
            let emailSubject = "Your Order Confirmation";
            
            const subtotal = orderDetails.subtotal || 0;
            const shippingFee = orderDetails.shippingFee || 0;
            const totalAmount = orderDetails.totalAmount || 0;

            let emailText = `Dear ${orderDetails.deliveryInfo.name},\n\n`;
            emailText += `Thank you for your order with us! Your payment was successful, and your order (ID: ${orderId}) has been confirmed.\n\n`;
            emailText += `Order Summary:\n`;
            orderDetails.items.forEach(item => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemTotal = itemPrice * item.quantity;
                emailText += `- ${item.title} (Qty: ${item.quantity}) - ₦${itemPrice.toLocaleString()} each | Total: ₦${itemTotal.toLocaleString()}\n`;
            });
            emailText += `\nSubtotal: ₦${subtotal.toLocaleString()}\n`;
            if (orderMethod === "delivery") {
                emailText += `Shipping: ₦${shippingFee.toLocaleString()}\n`;
            }
            emailText += `Total: ₦${totalAmount.toLocaleString()}\n\n`;

            let emailHtml = `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden; border: 1px solid #e0e0e0;">
                <div style="background-color: #4A90E2; padding: 25px 30px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 700;">Order Confirmed! 🎉</h1>
                    <p style="margin: 5px 0 0; font-size: 16px;">Thank you for your purchase, ${orderDetails.deliveryInfo.name}!</p>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px; color: #333333; line-height: 1.6;">Your order (ID: <strong style="color: #4A90E2;">${orderId}</strong>) has been successfully placed and confirmed.</p>
                    
                    <h3 style="margin-top: 30px; margin-bottom: 15px; color: #333333; font-size: 20px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Order Summary</h3>
                    
                    <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 25px; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                        <thead>
                            <tr style="background-color: #f8f8f8;">
                                <th style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: left; font-size: 14px; color: #555555;">Product</th>
                                <th style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: center; font-size: 14px; color: #555555;">Qty</th>
                                <th style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 14px; color: #555555;">Price</th>
                                <th style="padding: 15px; border-bottom: 1px solid #e0e0e0; text-align: right; font-size: 14px; color: #555555;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            orderDetails.items.forEach(item => {
                const itemPrice = parseFloat(item.price) || 0;
                const itemTotal = itemPrice * item.quantity;
                emailHtml += `
                    <tr style="border-bottom: 1px solid #eeeeee;">
                        <td style="padding: 15px; text-align: left; display: flex; align-items: center;">
                            ${item.image ? `<img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 15px; border-radius: 8px; border: 1px solid #dddddd;">` : '<div style="width: 60px; height: 60px; background-color: #f0f0f0; border-radius: 8px; margin-right: 15px; display: inline-flex; justify-content: center; align-items: center; color: #aaaaaa; font-size: 12px; border: 1px solid #dddddd;">No Image</div>'}
                            <span style="font-size: 15px; color: #333333; font-weight: 500;">${item.title}</span>
                        </td>
                        <td style="padding: 15px; text-align: center; font-size: 15px; color: #555555;">${item.quantity}</td>
                        <td style="padding: 15px; text-align: right; font-size: 15px; color: #555555;">₦${itemPrice.toLocaleString()}</td>
                        <td style="padding: 15px; text-align: right; font-size: 15px; color: #333333; font-weight: 600;">₦${itemTotal.toLocaleString()}</td>
                    </tr>
                `;
            });

            emailHtml += `
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600; color: #333333; border-top: 1px solid #e0e0e0;">Subtotal:</td>
                                <td style="padding: 15px; text-align: right; font-weight: 700; color: #333333; border-top: 1px solid #e0e0e0;">₦${subtotal.toLocaleString()}</td>
                            </tr>
            `;

            if (orderMethod === "delivery") {
                emailHtml += `
                            <tr>
                                <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600; color: #333333;">Shipping:</td>
                                <td style="padding: 15px; text-align: right; font-weight: 700; color: #333333;">₦${shippingFee.toLocaleString()}</td>
                            </tr>
                `;
            }

            emailHtml += `
                            <tr style="background-color: #f2f2f2;">
                                <td colspan="3" style="padding: 15px; text-align: right; font-weight: 700; font-size: 18px; color: #222222; border-top: 2px solid #e0e0e0;">Total:</td>
                                <td style="padding: 15px; text-align: right; font-weight: 700; font-size: 18px; color: #222222; border-top: 2px solid #e0e0e0;">₦${totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
            `;
            
            if (orderMethod === "pickup") {
                emailText += "\nYour order is ready for pickup at our main office:";
                emailText += "\nPickup Address: Block 'N' shop 57 & 58, also known as Pepsi Building, Orodumu, Ebute Ero Market, Lagos Island, Nigeria.";
                emailText += "\nPlease pick up your order during business hours: Monday – Saturday, 9:00 AM – 6:00 PM.";
                emailText += "\nDon't forget to bring your order ID.";
                
                emailHtml += `
                    <div style="background-color: #e6f7ff; border: 1px solid #99ddff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                        <p style="font-size: 16px; color: #333333; margin: 0 0 10px 0;"><strong style="color: #4A90E2;">Your order is ready for pickup!</strong></p>
                        <p style="font-size: 15px; color: #555555; margin: 0;"><strong>Pickup Address:</strong> Block 'N' shop 57 & 58, also known as Pepsi Building, Orodumu, Ebute Ero Market, Lagos Island, Nigeria.</p>
                        <p style="font-size: 15px; color: #555555; margin: 5px 0 0;"><strong>Hours:</strong> Monday – Saturday, 9:00 AM – 6:00 PM</p>
                        <p style="font-size: 14px; color: #777777; margin: 15px 0 0;">Please bring your order ID and a valid identification for pickup.</p>
                    </div>
                `;
            } else {
                emailText += "\nYour order is being prepared for delivery and will be dispatched soon.";
                emailText += "\nWe will send you a separate notification once your order is out for delivery.";
                
                emailHtml += `
                    <div style="background-color: #e6f7ff; border: 1px solid #99ddff; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                        <p style="font-size: 16px; color: #333333; margin: 0 0 10px 0;"><strong style="color: #4A90E2;">Your order is on its way!</strong></p>
                        <p style="font-size: 15px; color: #555555; margin: 0;">Your order is being prepared for delivery and will be dispatched soon.</p>
                        <p style="font-size: 15px; color: #555555; margin: 5px 0 0;">We'll send you a separate notification once your order is out for delivery.</p>
                    </div>
                `;
            }

            emailText += "\n\nThank you for shopping with us! If you have any questions, please reply to this email.";
            emailHtml += `
                <p style="font-size: 16px; color: #333333; text-align: center; margin-top: 30px;">
                    Thank you for shopping with us! If you have any questions, please reply to this email.
                </p>
                <div style="text-align: center; margin-top: 25px;">
                    <a href="${baseUrl}/orders" style="display: inline-block; padding: 12px 25px; background-color: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">View Your Order</a>
                </div>
                <p style="font-size: 13px; color: #999999; text-align: center; margin-top: 30px;">
                    &copy; ${new Date().getFullYear()} Your Store Name. All rights reserved.
                </p>
                </div>
            </div>
            `;


            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: userEmail,
                subject: emailSubject,
                text: emailText,
                html: emailHtml,
            });
            console.log(`Order confirmation email sent successfully! MessageId: ${info.messageId}`);
        } catch (emailError) {
            console.error("Error sending order confirmation email (Nodemailer):", emailError);
        }
    }

    if (updatedOrder && paymentStatus === "successful") {
      console.log("Order updated successfully. Redirecting to successful status page.");
      return NextResponse.redirect(`${baseUrl}/status?status=successful&orderId=${orderId}`);
    } else {
      console.log("Payment failed. Redirecting to failed status page.");
      return NextResponse.redirect(`${baseUrl}/status?status=failed&orderId=${orderId}`);
    }

  } catch (error) {
    console.error("Payment verification error in catch block (Overall):", error);
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed", orderStatus: "cancelled" });
    }
    return NextResponse.redirect(`${baseUrl}/status?status=failed`);
  }
}
