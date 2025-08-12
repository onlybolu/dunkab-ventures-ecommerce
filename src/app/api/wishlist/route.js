import { NextResponse } from 'next/server';
import User from '../../../../models/user';
import Connectdb from '../../../../lib/connectdb';

export async function POST(req) {
    try {
      await Connectdb();
      const { userId, productId } = await req.json();
      const user = await User.findByIdAndUpdate(userId, {
        $push: { wishlist: productId },
      });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Product added to wishlist' });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to add product to wishlist' }, { status: 500 });
    }
  }