import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import SupabaseProvider from '@/contexts/SupabaseProvider'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const quicksand = Quicksand({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "CrowdCart Studio",
  description: "A group buying platform for communities",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${quicksand.variable} font-sans antialiased bg-background text-foreground`}>
        <SupabaseProvider session={session}>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  );
}
