"use client";
import { Links } from "@/types/navbar/navbar";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

type NavLinksProps = {
  mobileLinks: Links[];
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void; // 🔥 add setter from parent
};

const MobileNav = ({
  mobileLinks,
  isMobileOpen,
  setIsMobileOpen,
}: NavLinksProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const toggleSubMenu = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    setOpenSubIndex(null);
  };

  const toggleSubSubMenu = (index: number) => {
    setOpenSubIndex(openSubIndex === index ? null : index);
  };

  // 🔥 Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    }

    if (isMobileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.classList.add("overflow-hidden");
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileOpen, setIsMobileOpen]);

  return (
    <div
      ref={menuRef}
      className={`fixed top-21 md:top-13 right-0 h-full overflow-y-auto w-76 bg-white z-50 shadow-2xl transform border-t-3 border-green-600 transition-transform duration-500 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <ul className="flex flex-col text-base font-semibold tracking-[1px]">
        {mobileLinks.map((l, i) => (
          <li key={i} className="flex flex-col w-full">
            <div className="flex items-center justify-between p-3 border-gray-300 border-b-1 hover:bg-gray-100">
              {l.href ? (
                <Link href={`${l.href}`}>
                  <h4 className="font-medium hover:text-[#666666] transition-colors duration-300 flex items-center gap-2">
                    {l.icon}
                    <span>{l.label}</span>
                    {l.extraLabel && (
                      <span className="bg-green-500 text-white text-[10px] px-1 py-0.5 rounded -mt-2">
                        NOW
                      </span>
                    )}
                  </h4>
                </Link>
              ) : (
                <h4 className="font-medium hover:text-[#666666] transition-colors duration-300 flex items-center gap-2 cursor-default">
                  {l.icon}
                  <span>{l.label}</span>
                  {l.extraLabel && (
                    <span className="bg-green-500 text-white text-[10px] px-1 py-0.5 rounded -mt-2">
                      NOW
                    </span>
                  )}
                </h4>
              )}
              {l.dropDown && (
                <button
                  onClick={() => toggleSubMenu(i)}
                  className={`${
                    openIndex === i
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-200 hover:bg-gray-300"
                  } py-2 px-2 rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      openIndex === i ? "rotate-180 text-white" : "rotate-0"
                    } cursor-pointer flex transition-transform duration-300`}
                  >
                    {l.dropDown}
                  </span>
                </button>
              )}
            </div>

            {/* Submenu */}
            {l.subMenuLinks && openIndex === i && (
              <ul>
                {l.subMenuLinks.map((sub, j) => (
                  <li key={j}>
                    <div className="flex items-center justify-between p-3 border-b border-gray-300 hover:bg-gray-50">
                      {sub.href ? (
                        <Link
                          href={`${sub.href}`}
                          className="flex items-center gap-2 font-medium hover:text-[#666666] transition-colors"
                        >
                          {sub.icon}
                          <span>{sub.label}</span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 font-medium cursor-default hover:text-[#666666] transition-colors">
                          {sub.icon}
                          <span>{sub.label}</span>
                        </div>
                      )}
                      {sub.subSubMenu && (
                        <button
                          onClick={() => toggleSubSubMenu(j)}
                          className={`${
                            openSubIndex === j
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-200 hover:bg-gray-300"
                          } py-2 px-2 rounded-full`}
                        >
                          <span
                            className={`${
                              openSubIndex === j
                                ? "rotate-180 text-white"
                                : "rotate-0"
                            } cursor-pointer flex transition-transform duration-300`}
                          >
                            {sub.dropDown}
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Sub-Submenu */}
                    {sub.subSubMenu && openSubIndex === j && (
                      <ul className="">
                        {sub.subSubMenu.map((child, k) => (
                          <li
                            key={k}
                            className="font-medium text-[#312727] hover:text-[#666666] transition-colors py-3 pl-10 border-b border-gray-300 hover:bg-gray-50"
                          >
                            {child.href ? (
                              <Link href={`${child.href}`}>
                                <span>{child.label}</span>
                              </Link>
                            ) : (
                              <span>{child.label}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MobileNav;
