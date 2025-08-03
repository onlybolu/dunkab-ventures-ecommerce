import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbconnect from "../../../../../lib/dbconnect";
import User from "../../../../../models/user";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      try {
        await dbconnect();

        const user = await User.findOne({ email: profile.email });
        if (!user) {
          await User.create({
            name: profile.name,
            email: profile.email,
            googleId: profile.sub,
          });
        }
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
});