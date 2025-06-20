import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'
import '@repo/ui/globals.css'
import { Toaster } from "@repo/ui/components/sonner";
import { CookiesProvider } from 'next-client-cookies/server';
import { Providers } from '@/components/providers'
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Requro | Hiring got easier',
  description: 'Requro is a hiring platform that helps you find the right talent for your team.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <Providers
          >
          <Toaster
            toastOptions={{
              unstyled: false,
              classNames: {
                success: "text-green-800"
              }
            }}
            position='bottom-center' />
          <CookiesProvider>
          {children}
          </CookiesProvider>
          </Providers>
        </body>
      </html>
    </SessionProvider>
  )
}
