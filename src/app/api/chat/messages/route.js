// pages/api/chat/messages.js
import { NextResponse } from 'next/server';
import Connectdb from '../../../../../lib/connectdb'; // Adjust path as needed
import Message from '../../../../../models/Message'; // Adjust path as needed

export async function GET(req) {
  await Connectdb();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // --- FIX: Directly query the Message model using the userId string ---
    // Removed the problematic User.findById(userId) call.
    const messages = await Message.find({ userId })
      .sort({ timestamp: 1 }) // Sort in ascending order (oldest first)
      .lean(); // Use .lean() for faster query results

    // Ensure timestamps are returned as ISO strings for consistency with frontend
    const formattedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
      id: msg._id.toString(), // Convert ObjectId to string for frontend key
    }));

    return NextResponse.json(
      { success: true, messages: formattedMessages },
      { status: 200 }
    );

  } catch (error) {
    console.error('API /api/chat/messages error:', error);
    // Log the actual error for debugging on your server
    return NextResponse.json(
      { success: false, message: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
