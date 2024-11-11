// This file Auth.js is used to configure the authentication provider and export the necessary functions
//  to be used in the app. ./src/Auth.js
import NextAuth from "next-auth";
import authConfig from "@/infrastructure/auth/nextauth/auth.config";

export const {
  auth,
  handlers: { GET, POST },
  signIn,
  signOut,
} = NextAuth(authConfig);
