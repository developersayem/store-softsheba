"use client"
import React from 'react'
import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("../navbar/Navbar"), { ssr: false });
const Footer = dynamic(() => import("../footer/Footer"), { ssr: false });

import { usePathname } from 'next/navigation';

export default function Wrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
  const hideRoutes = ["/product", "/shop", "/product-category", "/product-tag", "/my-account", "/admin-dashboard", "/login", "/dashboard"];
  const hideLayout = hideRoutes.some((route) => pathname.startsWith(route));
  
  const hideFooterRoutes = ["/admin-dashboard", "/login", "/dashboard"];
  const hideFooter = hideFooterRoutes.some((route) => pathname.startsWith(route));

  return (
    <>
        {!hideLayout && <Navbar />}
      <main className={`${hideLayout ? "": "lg:pt-23 xl:pt-28"}`}>{children}</main>
      {
       !hideFooter &&
      <Footer />
      }
      </>
  )
}
