// pages/api/cart.js
import { NextResponse } from 'next/server';
import User from '../../../models/user';
import Connectdb from '../../../lib/connectdb';

export async function POST(req) {
  try {
    await Connectdb();
    const product = await req.json();
    const user = await User.findByIdAndUpdate(req.user.id, {
      $push: { cart: { productId: product._id, quantity: product.quantity } },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product added to cart' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add product to cart' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await Connectdb();
    const { productId } = await req.json();
    const user = await User.findByIdAndUpdate(req.user.id, {
      $pull: { cart: { productId: productId } },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Product removed from cart' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove product from cart' }, { status: 500 });
  }
}