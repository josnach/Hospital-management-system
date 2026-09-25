import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Healthcare System",
  description: "Healthcare management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body
          className={`${GeistSans.variable} ${GeistMono.variable}`}
        >
          {children}

          <Toaster
            richColors
            position="top-center"
          />
        </body>
      </html>
    </ClerkProvider>
  );
}