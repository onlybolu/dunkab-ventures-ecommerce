import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbconnect from "../../../../../lib/dbconnect";
import User from "../../../../../models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await dbconnect();

        // Check if the user already exists in the database
        const existingUser = await User.findOne({ email: profile.email });
        if (!existingUser) {
          // Create a new user if they don't exist
          await User.create({
            name: profile.name,
            email: profile.email,
            googleId: profile.sub,
          });
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async session({ session, token }) {
      // Attach the user ID to the session
      session.user.id = token.sub;
      return session;
    },
  },
});

export { handler as GET, handler as POST };