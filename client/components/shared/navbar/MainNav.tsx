"use client";
import NavLinks from "./NavLinks";
import { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUser,
} from "react-icons/fa";
import Image from "next/image";
import { Links } from "@/types/navbar/navbar";
import Link from "next/link";

const MainNav = () => {
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const desktopLinks: Links[] = [
    {
      icon: <FaHome size={16} />,
      label: "Go to Home",
      href: "https://softsheba.com/"
    },
    {
      label: "Knowledge",
      href: "https://softsheba.com/knowledge-base/"
    },
    {
      label: "Shop",
      href: "/shop"
    },
    {
      label: "Support",
      href: "https://softsheba.com/support/"
    },
    {
      icon: <FaUser size={16} />,
      label: "My Account",
      href: "https://crm.softsheba.com/authentication/login"
    },
  ];

  const mobileLinks: Links[] = [
    {
      icon: <FaHome size={16} />,
      label: "Go to Home",
      href: "https://softsheba.com/"
    },
    {
      label: "Knowledge",
      href: "https://softsheba.com/knowledge-base/"
    },
    {
      label: "Shop",
      href: "/shop"
    },
    {
      label: "Support",
      href: "https://softsheba.com/support/"
    },
    {
      icon: <FaUser size={16} />,
      label: "My Account",
      href: "https://crm.softsheba.com/authentication/login"
    },
  ];

  return (
    <div
      className={`w-full shadow-xl flex justify-between items-center px-5 md:px-6 py-5 md:py-1 lg:py-0 z-50 bg-white`}
    >
      <Link href="/">
        <div>
          <Image
            src="/assets/logo/softsheba-crm.webp"
            alt=""
            width={200}
            height={20}
          />
        </div>
      </Link>
      <NavLinks
        desktopLinks={desktopLinks}
        mobileLinks={mobileLinks}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="block px-2 lg:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-blue-900 cursor-pointer"
        >
          {isMobileOpen ? <FaTimes size={26} /> : <FaBars size={26} />}
        </button>
      </div>
    </div>
  );
};

export default MainNav;
