"use client";

import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 mt-0 text-center bg-gradient-to-br from-white via-gray-100 lg:-mt-22 xl:-mt-29">
      {/* Big 404 Number */}
      <h1 className="text-[120px] sm:text-[150px] md:text-[180px] font-extrabold text-pink-600 animate-pulse">
        404
      </h1>

      {/* Heading */}
      <h2 className="mt-6 text-2xl font-semibold text-gray-700 sm:text-3xl md:text-4xl">
        Oops! Page not found
      </h2>

      {/* Description */}
      <p className="max-w-xl mx-auto mt-2 text-sm text-gray-500 sm:text-base md:text-lg">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="group mt-8 px-6 py-3 inline-flex items-center gap-2 rounded-lg border-2 border-[#15b886] text-[#15b886] font-medium transition-all duration-300 hover:bg-[#15b886] hover:text-white shadow-md"
      >
        Go to Home
        <span className="transition-transform transform group-hover:translate-x-1">
          <IoIosArrowForward size={20} />
        </span>
      </Link>

      {/* Optional Footer */}
      <p className="mt-10 text-xs text-gray-400 sm:text-sm">
        © {new Date().getFullYear()} Your Company Name. All rights reserved.
      </p>
    </div>
  );
}
