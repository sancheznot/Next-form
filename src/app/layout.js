import "./globals.css"
import Provider from "@/components/Providers"
import Nav from "@/components/MainPage/Nav/Nav"

export const metadata = {
  title: "Template",
  description: "Template with nextjs and tailwindcss",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    userScalable: "no",
  },
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.png",
  },
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          <Nav />
          {children}
        </Provider>
      </body>
    </html>
  )
}