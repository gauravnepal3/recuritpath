import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@repo/ui/components/sonner";

import "@repo/ui/globals.css"
import { Providers } from "@/components/providers"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <Toaster
            toastOptions={{
              unstyled: false,
              classNames: {
                success: "text-green-800"
              }
            }}
            position='bottom-center' />
          <div className="min-h-screen">
            {children}
          </div>
          <footer className="py-7 text-xs text-center">
            Powered by Requro
          </footer>
        </Providers>

      </body>
    </html>
  )
}
