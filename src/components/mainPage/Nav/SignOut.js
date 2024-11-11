// ./src/components/MainPage/Nav/SignOut.js
"use client"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function SignOut() {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await signOut({ 
        redirect: false
      })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={`bg-danger hover:bg-danger-400 text-white font-medium rounded-lg px-4 py-2 
        ${isSigningOut ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isSigningOut ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}