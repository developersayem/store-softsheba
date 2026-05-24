import React from "react";
import {
  FaEnvelope,
  FaHeadset,
  FaPhoneAlt,
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";

export default function TopNav() {
  return (
    <div
      className={`bg-[#15BF86] py-[5px] px-9 hidden lg:flex justify-between text-sm text-white font-semibold`}
    >
      {/* Social links */}
      <div className="flex gap-2 font-bold">
        <Link
          href="https://www.facebook.com/SoftshebaLtd"
          target="_blank"
          className="flex items-center justify-center w-6 h-6 text-white transition-all duration-300 bg-green-600 rounded-full hover:bg-blue-500 "
        >
          <FaFacebookF size={14} />
        </Link>
        <Link
          href="https://www.linkedin.com/company/softsheba/"
          target="_blank"
          className="flex items-center justify-center w-6 h-6 text-white transition-all duration-300 bg-green-600 rounded-full hover:bg-blue-500 "
        >
          <FaLinkedinIn size={14} />
        </Link>
        <Link
          href="https://www.instagram.com/softsheba/"
          target="_blank"
          className="flex items-center justify-center w-6 h-6 text-white transition-all duration-300 bg-green-600 rounded-full hover:bg-yellow-500 "
        >
          <FaInstagram size={14} />
        </Link>
        <Link
          href="https://www.youtube.com/@SoftshebaOfficial"
          target="_blank"
          className="flex items-center justify-center w-6 h-6 text-white transition-all duration-300 bg-green-600 rounded-full hover:bg-red-500 "
        >
          <FaYoutube size={14} />
        </Link>
      </div>

      {/* Support links */}
      <div className="flex items-start">
        <div className="flex">
          <Link
            href="tel:8801967557799"
            target="_blank"
            className="flex items-center gap-1 pr-8"
          >
            <FaPhoneAlt size={18} />
            Sales: 8801967557799
          </Link>
          <span className="text-gray-300 font-[300]">|</span>
        </div>
        <div className="flex">
          <Link
            href="https://wa.me/8801969888555"
            target="_blank"
            className="flex items-center gap-1 pr-8 ml-6"
          >
            <FaHeadset size={18} />
            Support(Whatsapp): 8801969888555
          </Link>
          <span className="text-gray-300 font-[300]">|</span>
        </div>
        <div className="flex">
          <Link
            href="mailto:support@softsheba.com"
            target="_blank"
            className="flex items-center gap-1 text-[13px] ml-6"
          >
            <FaEnvelope size={18} />
            support@softsheba.com
          </Link>
        </div>
      </div>
    </div>
  );
}