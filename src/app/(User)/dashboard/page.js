import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();

   // If no session, redirect to login
   if (!session) {
    redirect("/login")
  }

  // If 2FA is required, redirect to verification
  if (session.requiresTwoFactor) {
    redirect("/auth/verify-2fa")
  }

  // Ensure we have complete user information
  if (!session.user?.id) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      <pre>{JSON.stringify(session.user, null, 2)}</pre>
    </div>
  );
}
