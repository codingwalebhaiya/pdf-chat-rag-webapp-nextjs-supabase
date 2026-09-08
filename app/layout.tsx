import { Geist_Mono, Outfit, Roboto } from "next/font/google"
import Loading from "./loading"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import type { Metadata } from "next"
import { Suspense } from "react";
import {Toaster} from "@/components/ui/sonner"

// const robotoHeading = Roboto({subsets:['latin'],variable:'--font-heading'});
// const outfit = Outfit({subsets:['latin'],variable:'--font-sans'})

// const fontMono = Geist_Mono({
//   subsets: ["latin"],
//   variable: "--font-mono",
// })


const robotoHeading = Roboto({
  weight: ["400", "700"], // Roboto requires explicit weights in Next.js
  subsets: ["latin"],
  variable: "--font-heading",
});

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const metadata: Metadata = {
  title: {
    default: "PDF Chat",
    template: "%s | PDF Chat",
  },
  description: "Chat with your PDF documents using AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        outfit.variable,
        robotoHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </ThemeProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
