import Nav from "@/components/mainPage/Nav/Nav"
import "./globals.css"
import "./style/chakra-scope.css"
import Provider from "@/components/Providers"

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