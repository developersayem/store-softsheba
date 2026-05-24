import Link from 'next/link';
import React from 'react';
import { FaEnvelope,  FaPhoneAlt, FaShoppingCart } from 'react-icons/fa';

const TopNav = () => {
    return (
        <div className='hidden lg:flex justify-between bg-[#15BF86] text-sm font-bold py-2 px-4 md:px-6 lg:px-10'>
                <div className="flex flex-wrap items-center justify-center text-white">
        <div className="flex">
          <Link
            href="tel:8801967557799"
            target="_blank"
            className="flex items-center gap-1 pr-2"
          >
            <FaPhoneAlt size={14} />
            Sales: 8801967557799
          </Link>
          <span>|</span>
        </div>
        <div className="flex">
          <Link
            href="https://wa.me/8801969888555"
            target="_blank"
            className="ml-1"
          >
            Support: 8801969888555
          </Link>
        </div>
        <div className="flex">
          <Link
            href="mailto:support@softsheba.com"
            target="_blank"
            className="flex items-center gap-1 ml-4"
          >
            <FaEnvelope size={14} />
            support@softsheba.com
          </Link>
        </div>
            </div>
            <div className='hidden md:flex text-white items-center gap-2'>
                <FaShoppingCart size={18}/> <span>O Items</span>
            </div>
        </div>
    );
};

export default TopNav;