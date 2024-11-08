import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { connectMongoDB } from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        await connectMongoDB();

        const userExists = await User.findOne({ email: profile.email });
        if (userExists) return userExists;

        try {
          const userpassword = profile.given_name + Math.floor(Math.random() * 1000000000);
          const salt = await bcrypt.genSalt(12);
          const passwordEncrypted = await bcrypt.hash(userpassword, salt);

          const newUser = await User.create({
            email: profile.email,
            name: profile.given_name || profile.name.split(" ")[0],
            lastname: profile.family_name || profile.name.split(" ")[1] || "",
            password: passwordEncrypted,
            image: profile.picture,
            accountStatus: "active",
          });

          return newUser;
        } catch (error) {
          console.error("Error creating user from OAuth profile:", error);
          throw new Error("User validation failed");
        }
      },
    }),
    Credentials({
      async authorize(credentials) {
        try {
          await connectMongoDB();
          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) throw new Error("No user found with this email");
          if (user.accountStatus !== "active") {
            throw new Error(`Your account has been ${user.accountStatus}`);
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) throw new Error("Invalid password");

          user.password = undefined;
          return user;
        } catch (error) {
          console.error("Auth error:", error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.user = {
          _id: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          accountStatus: user.accountStatus,
          image: user.image,
          rol: user.rol,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
        };
      }
      return token;
    },
    session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    newUser: "/dashboard",
  },
}

export default authConfig