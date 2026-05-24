// app/product/layout.js

import Navbar from "@/components/products/ProductNavbar/Navbar";
import { NextFont } from "next/dist/compiled/@next/font";
import { Open_Sans } from "next/font/google";
import { ReactNode } from "react";

const openSans: NextFont = Open_Sans({
    subsets: ["latin"],
  weight: ["400","500", "600", "700"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export default function ProductLayout({ children }: {children: ReactNode}) {
  return (
    <div>
      <header className="absolute top-0 left-0 w-full">
        <Navbar />
      </header>

      <main className={`${openSans.className} lg:pt-23 xl:pt-28`}>
        {children} 
      </main>
    </div>
  );
}
