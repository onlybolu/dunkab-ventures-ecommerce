// /api/wishlist/route.js (Next.js API route)
import { getServerSession } from "next-auth";
// import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "../../../../lib/dbconnect";
// import Wishlist from "../../../models/wishlist";

export async function POST(req) {
//   const session = await getServerSession(authOptions);
//   if (!session) return new Response("Unauthorized", { status: 401 });

//   const { productId } = await req.json();
//   await dbConnect();

//   await Wishlist.create({ userId: session.user.id, productId });
//   return new Response(JSON.stringify({ success: true }));
// }

// export async function DELETE(req) {
//   const session = await getServerSession(authOptions);
//   if (!session) return new Response("Unauthorized", { status: 401 });

//   const { productId } = await req.json();
//   await dbConnect();

//   await Wishlist.deleteOne({ userId: session.user.id, productId });
//   return new Response(JSON.stringify({ success: true }));
}