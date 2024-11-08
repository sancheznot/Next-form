import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function checkAuth() {
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }
  
  return session
}