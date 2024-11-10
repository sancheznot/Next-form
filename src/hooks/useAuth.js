"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

export function useAuth(initialSession) {
  const { data: session, status } = useSession()
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // on the server, return the initial session
  if (!isClient) {
    return {
      session: initialSession,
      status: "loading",
      isAuthenticated: !!initialSession?.user?.id
    }
  }

  // on the client, return the session from the useSession hook
  return {
    session: session,
    status,
    isAuthenticated: !!session?.user?.id
  }
}