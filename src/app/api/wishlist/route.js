import { NextResponse } from 'next/server';
import User from '../../../../models/user';
import Connectdb from '../../../../lib/connectdb';


export async function GET(req) {
  try {
    await Connectdb();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = await User.findById(userId).select('wishlist');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, wishlist: user.wishlist }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'Failed to fetch wishlist' }, { status: 500 });
  }
}

// POST - Add or remove a product from a user's wishlist
export async function POST(req) {
  try {
    await Connectdb();
    const { userId, productId } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    let message = '';
    let updatedUser;

    
    const productExists = user.wishlist.some(item => item.toString() === productId);

    if (productExists) {
    
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId } },
        { new: true } 
      );
      message = 'Product removed from wishlist';
    } else {
   
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productId } },
        { new: true } 
      );
      message = 'Product added to wishlist';
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
    }

  
    return NextResponse.json({
      message,
      wishlist: updatedUser.wishlist // Now returning the updated wishlist
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 });
  }
}
