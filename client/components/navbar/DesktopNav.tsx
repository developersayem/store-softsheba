"use client";
import { Links } from "@/types/navbar/navbar";
import Link from "next/link";
import React, { useState } from "react";

type NavLinksProps = {
  desktopLinks: Links[];
};

const DesktopNav = ({ desktopLinks }: NavLinksProps) => {
  const [onHover, setOnHover] = useState<string>("");

  return (
    <ul className="hidden lg:flex items-center text-base font-semibold tracking-[1px] relative">
      {desktopLinks.map((l, i) => (
        <li
          key={i}
          className="relative lg:py-5 lg:px-3 xl:py-7 xl:px-4.5"
          onMouseEnter={() => setOnHover(l.label)}
          onMouseLeave={() => setOnHover("")}
        >
          <Link href={`${l.href}`}>
            <h4 className="lg:text-sm xl:text-base font-medium hover:text-[#666666] transition-colors duration-700 flex items-start gap-1">
              {l.icon}
              <span>{l.label}</span>
              {l.extraLabel && (
                <span className="bg-green-600 text-white text-[10px] px-1 py-1 rounded -mt-2">
                  {l.extraLabel}
                </span>
              )}
            </h4>
          </Link>
           {onHover === l.label && (
            <div
              className={`${l.label === "SHOP" ? "opacity-0":"opacity-full"} absolute -bottom-2.5 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-transparent border-b-white left-1/2 transform -translate-x-[50%] transition-all duration-300`}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default DesktopNav;
