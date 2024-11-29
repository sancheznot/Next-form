//  This file auth.config.js is used to configure the authentication providers and callbacks for NextAuth.js
//  and export the necessary functions to be used in the app. ./src/auth.js
// ./src/auth.config.js

// Import the necessary modules

import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "./mongodb-adapter";
import bcrypt from "bcryptjs";
import User from "@/infrastructure/database/models/User";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      async profile(profile) {
        const userExists = await MongoDBAdapter.getUserByEmail(profile.email);
        if (userExists) return userExists;
        return await MongoDBAdapter.createUserFromOAuth(profile);
      }
    }),
    Credentials({
      async authorize(credentials) {
        if (credentials.twoFactorToken) {
          console.log("Processing 2FA verification for:", credentials.email);
          // Log received credentials for debugging
          console.log("Credentials received:", {
            ...credentials,
            password: "[REDACTED]",
          });

          const user = await User.findOne({
            email: credentials.email,
          }).select('+twoFactorSecret +backupCodes.code +backupCodes.used')

          if (!user) throw new Error("User not found");
          // Log user's backup codes structure
          console.log(
            "User backup codes structure:",
            JSON.stringify(
              {
                backupCodes: user.backupCodes,
                backupCodesLength: user.backupCodes?.length,
                hasBackupCodes: !!user.backupCodes,
              },
              null,
              2
            )
          );
          let isValid = false;

          if (credentials.isBackupCode === "true") {
            console.log("Verifying backup code:", credentials.twoFactorToken);
            // Use the model's method to verify backup code
            console.log(credentials.twoFactorToken)
            isValid = await user.verifyBackupCode(credentials.twoFactorToken);
          } else {
            console.log("Verifying 2FA token");
            // Use the model's method to verify token
            isValid = user.verify2FAToken(credentials.twoFactorToken);
          }

          if (!isValid) {
            const errorMsg =
              credentials.isBackupCode === "true"
                ? "Invalid backup code"
                : "Invalid verification code";
            throw new Error(errorMsg);
          }

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            image: user.image,
            rol: user.rol,
            isAdmin: user.isAdmin,
            accountStatus: user.accountStatus,
            twoFactorVerified: true,
          };
        }
        
        console.log("Processing initial login for:", credentials.email);
        const user = await User.findOne({ email: credentials.email }).select(
          "+password +twoFactorEnabled"
        );

        if (!user) throw new Error("No user found with this email");

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValidPassword) throw new Error("Invalid password");

        if (user.twoFactorEnabled) {
          return {
            id: user._id,
            email: user.email,
            requiresTwoFactor: true,
            twoFactorVerified: false,
          };
        }

        // Return complete user data for non-2FA users
        return {
          id: user._id,
          email: user.email,
          name: user.name,
          lastname: user.lastname,
          image: user.image,
          rol: user.rol,
          isAdmin: user.isAdmin,
          accountStatus: user.accountStatus,
          twoFactorVerified: true,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Handle session updates from client
      if (trigger === "update" && session) {
        // Preserve existing token data while updating with new session data
        return {
          ...token,
          requiresTwoFactor: session.requiresTwoFactor,
          twoFactorVerified: session.twoFactorVerified,
          user: {
            ...token.user,
            ...session.user,
          },
        };
      }

      // Handle user data during authentication flow
      if (user) {
        // Case 1: User requires 2FA
        if (user.requiresTwoFactor) {
          return {
            ...token,
            requiresTwoFactor: true,
            twoFactorVerified: false,
            email: user.email,
            // Store minimal user data needed for 2FA
            user: {
              email: user.email,
              id: user.id,
            },
          };
        }
        // Case 2: User is fully authenticated
        return {
          ...token,
          requiresTwoFactor: false,
          twoFactorVerified: user.twoFactorVerified,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            image: user.image,
            rol: user.rol,
            isAdmin: user.isAdmin,
            accountStatus: user.accountStatus,
          },
        };
      }
      return token;
    },
    async session({ session, token }) {
      // Case 1: Session requires 2FA
      if (token.requiresTwoFactor && !token.twoFactorVerified) {
        return {
          ...session,
          requiresTwoFactor: true,
          user: {
            email: token.email,
          },
        };
      }
      // Case 2: Fully authenticated session
      if (token.user) {
        return {
          ...session,
          requiresTwoFactor: false,
          user: token.user,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
    verify: "/auth/verify-2fa",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default authConfig;
