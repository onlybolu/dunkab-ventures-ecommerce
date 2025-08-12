import Product from '../../../../models/product';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await Product.distinct('category');
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching categories' }, { status: 500 });
  }
}