import { NextResponse } from 'next/server';
import Connectdb from '../../../../../lib/connectdb';
import Message from '../../../../../models/Message';

export async function POST(req) {
  await Connectdb();

  try {
    const { userId, text, sender, timestamp } = await req.json();

    if (!userId || !text || !sender || !timestamp) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: userId, text, sender, timestamp' },
        { status: 400 }
      );
    }

    
    if (!['user', 'admin'].includes(sender)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sender type. Must be "user" or "admin".' },
        { status: 400 }
      );
    }

   
    const newMessage = await Message.create({
      userId,
      text,
      sender,
      timestamp: new Date(timestamp), 
    });

    
    const autoResponseText = "Our agents are currently reviewing your message. Please wait, you will be responded to soon.";
    await Message.create({
      userId, 
      text: autoResponseText,
      sender: 'admin', 
      timestamp: new Date(new Date().getTime() + 500), 
    });

    return NextResponse.json(
      { success: true, message: 'Message sent successfully', messageId: newMessage._id },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('API /api/chat/send error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}