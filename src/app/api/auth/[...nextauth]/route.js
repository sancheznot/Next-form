import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        await connectMongoDB();

        // Check if required fields are present
        if (!profile.given_name) profile.given_name = profile.name.split(" ")[0] || "Unknown";
        if (!profile.family_name) profile.family_name = profile.name.split(" ")[1] || "Unknown";

        // Check if the user already exists in the database
        const userExists = await User.findOne({ email: profile.email });

        if (userExists) {
          // If user exists, return the existing user
          return userExists;
        } else {
          // If user does not exist, create a new user
          try {
            const userpassword = profile.given_name + Math.floor(Math.random() * 1000000000);
            const salt = await bcrypt.genSalt(12);
            const passwordEncrypted = await bcrypt.hash(userpassword, salt);

            const newUser = await User.create({
              email: profile.email,
              name: profile.given_name,
              lastname: profile.family_name,
              password: passwordEncrypted,
              image: profile.picture,
              accountStatus: "active", // Set default account status
            });

            return newUser;
          } catch (error) {
            console.error("Error creating user from OAuth profile:", error);
            throw new Error("User validation failed. Please provide all required information.");
          }
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          await connectMongoDB();
          const user = await User.findOne({ email: credentials.email }).select("+password");

          if (!user) {
            throw new Error("No user found with this email");
          }

          // Check account status
          if (user.accountStatus === "banned") {
            throw new Error("Your account has been banned.");
          }
          if (user.accountStatus === "suspended") {
            throw new Error("Your account has been suspended.");
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          user.password = undefined; // Remove password from user object
          return user;
        } catch (error) {
          console.error("Error during user authentication:", error.message);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Attach user data to token
        token.user = {
          _id: user._id,
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          image: user.image,
          rol: user.rol,
          isAdmin: user.isAdmin,
          createdAt: user.createdAt,
          accountStatus: user.accountStatus,
          phoneNumber: user.phoneNumber,
          address: user.address,
          reviewsHistory: user.reviewsHistory,
          wishList: user.wishList,
          orders: user.orders,
          cart: user.cart,
        };

        // Create a refresh token and save it to the user
        const refreshToken = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        user.refreshToken = refreshToken;
        user.refreshTokenExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        await user.save();
      }

      // If access token is expired, generate a new one using refresh token
      if (Date.now() >= token?.exp * 1000) {
        const user = await User.findOne({ _id: token.user._id });
        if (user.refreshToken === token.refreshToken) {
          const newAccessToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
          );
          token.accessToken = newAccessToken;
        } else {
          throw new Error("Refresh token is invalid");
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
        session.accessToken = token.accessToken; // Attach access token to session
      }

      // Automatically log out if account status is not active
      if (token.user.accountStatus !== "active") {
        session.user = null;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
    error: "/auth/error",
    newUser: "/dashboard",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
  },
  events: {
    async signIn(message) {
      console.log("User signed in", message);
    },
    async signOut(message) {
      console.log("User signed out", message);
    },
    async error(message) {
      console.error("NextAuth error:", message);
    },
  },
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
