import { nunito } from '@/lib/fonts/fonts';
import Link from 'next/link';
import React, { ReactNode, useEffect, useRef } from 'react'

type Navlink = {
  icon?: ReactNode;
  label: string;
  link: string;
}
type MobileNavProps = {
    isMobileOpen: boolean;
    navlink: Navlink[];
    setIsMobileOpen: (value: boolean) => void;
}

export default function MobileItem({isMobileOpen, navlink, setIsMobileOpen}: MobileNavProps) {
    const menuRef = useRef<HTMLDivElement>(null);
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
    <div className='lg:hidden'>
        <div ref={menuRef} className={`fixed top-19.5 md:top-20.5 right-0 h-full overflow-y-auto w-76 bg-white z-50 shadow-2xl transform border-t-3 border-green-600 transition-transform duration-500 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "translate-x-full"} ${nunito.className}`}>
            <ul className=''>
                {
                    navlink.map((n, i) => (
                        <li key={i} className='border-b border-gray-300 hover:bg-gray-100 text-gray-900 hover:text-gray-700 transition-all duration-200'>
                            <Link href={n.link} className='px-8 py-5 flex items-center gap-2'>{n.icon && n.icon} {n.label}</Link>
                        </li>
                    ))
                }
            </ul>
        </div>
    </div>
  )
}
