"use client"
import React, { useEffect, useState } from 'react'
import TopNav from './TopNav'
import MainNav from './MainNav'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header className="top-0 left-0 z-50 w-full bg-white lg:fixed ">
      {/* TopNav */}
      <div
        className={`transition-all duration-700 ${
          isScrolled ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
        }`}
      >
        <TopNav />
      </div>

      {/* MainNav */}
      <div
        className={`transition-all duration-700  sticky top-0 bg-white`}
      >
        <MainNav />
      </div>
    </header>
  )
}
