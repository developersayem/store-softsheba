"use client";
import { nunito } from "@/lib/fonts/fonts";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode, useState } from "react";
import { FaBars, FaHome, FaTimes, FaUser } from "react-icons/fa";
import MobileItem from "./MobileItem";
import { usePathname } from "next/navigation";

type Navlink = {
  icon?: ReactNode;
  label: string;
  link: string;
};

export default function MainNav() {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const navlink: Navlink[] = [
    {
      icon: <FaHome />,
      label: "Go to Home",
      link: "/",
    },
    {
      label: "Knowledge",
      link: "#",
    },
    {
      label: "Shop",
      link: "/shop",
    },
    {
      label: "Support",
      link: "/support",
    },
    {
      icon: <FaUser />,
      label: "My Account",
      link: "/my-account",
    },
  ];

  return (
    <div
      className={`${nunito.className}  w-full shadow-xl py-5 lg:py-4 sticky top-0 z-50 bg-[#f2f2f2] lg:bg-white`}
    >
      <div className="relative flex items-center justify-between px-10 mx-auto md:px-14 lg:px-10 xl:px-0 lg:max-w-6xl">
        <Link href="/">
          <div>
            <Image
              src="/assets/logo/softsheba-crm.webp"
              alt=""
              width={180}
              height={20}
            />
          </div>
        </Link>

        <ul className="items-center hidden gap-6 lg:flex">
          {navlink.map((n, i) => {
  const isActive =
    n.link === "/"
      ? pathname === "/"
      : pathname === n.link || pathname.startsWith(n.link);

  return (
    <li
      key={i}
      className={`relative group transition-all duration-500 ${
        isActive ? "text-[#15bf86]" : "hover:text-[#15bf86]"
      }`}
    >
      <Link
        href={n.link}
        className="flex items-center gap-1.5 font-semibold text-base"
      >
        {n.icon && n.icon}
        {n.label}
      </Link>

      <span
        className={`absolute left-0 -bottom-1 h-[2px] bg-[#15bf86] transition-all duration-500 ${
          isActive ? "w-full" : "w-0 group-hover:w-full"
        }`}
      />
    </li>
  );
})}

        </ul>

        <MobileItem
          isMobileOpen={isMobileOpen}
          navlink={navlink}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div className="block px-2 lg:hidden">
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-blue-900 cursor-pointer"
          >
            {isMobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
