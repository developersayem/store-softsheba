import type { Metadata } from "next";
import "./globals.css";
import Wrapper from "@/components/wrapper/Wrapper";
import { NextFont } from "next/dist/compiled/@next/font";
import { Open_Sans, Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Softsheba",
  description:
    "Softsheba Ltd provides web design, app development, SEO, and hosting to boost your online presence.",
    other: {
    'font-display': 'swap'
  }
};
const openSans: NextFont = Open_Sans({
    subsets: ["latin"],
  weight: ["400","500", "600", "700"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preload" href="/_next/static/chunks/[root-of-the-server]__8d5f5124._.css" as="style" />
      </head>
      <body
        className={`${openSans.className} antialiased`}
        suppressHydrationWarning
      >
        <Wrapper>
          <main>
          {children}
          </main>
        </Wrapper>
      </body>
    </html>
  );
}
