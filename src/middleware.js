// ./src/middleware.js
import authConfig from "./auth.config"
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  // Add custom logic here
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/protected/:path*"]
}