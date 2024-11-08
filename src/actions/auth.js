// This file contains the actions related to authentication
// It exports a function called handleSignOut that is used to sign out the user
// ./src/actions/auth.js

"use server";

import { signOut } from "@/auth";

export async function handleSignOut() {
  await signOut({
    redirectTo: "/login",
  });
}
