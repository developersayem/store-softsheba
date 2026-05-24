"use client"
import Link from 'next/link';
import React from 'react'
import { IoIosArrowForward } from 'react-icons/io';
type FooterResources = {
label: string;
link?: string;
};

export default function FooterResources() {

    const resources: FooterResources[] = [
      { label: "Account", link: "#" },
      { label: "Support", link: "#" },
      { label: "Privacy Policy", link: "#" },
      { label: "Support Policy", link: "#" },
      { label: "Refund Policy", link: "#" },
      { label: "Terms of Use", link: "#" },
      { label: "Downloads", link: "#" },
      { label: "Project", link: "#" },
      { label: "Blog", link: "#" },
    ];
  return (
    <div>
        <h5 className='text-lg text-[#333333] font-semibold'>
            Resources
        </h5>
        <ul className='px-4 mt-2 space-y-2 text-gray-500 list-disc'>
            {
                resources.map((r, i) => (
                    <li key={i}>
                       {
                            r.link ? 
                        <Link href={`${r.link}`}  className='text-[#2ae048]'>
                        {r.label}
                        </Link>:
                        <button className='text-gray-600'>
                            {r.label}
                        </button>
                        }
                    </li>
                ))
            }
        </ul>
         <Link
  href="/become-a-reseller"
  className="group bg-[#15b886] text-white border py-2 px-5 rounded-md flex justify-center items-center gap-1 transition-all cursor-pointer mt-4 lg:mt-16 text-base font-bold w-fit"
>
  BECOME A SELLER
  <span className="overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-[20px]">
    <IoIosArrowForward size={20} className="ml-1" />
  </span>
</Link>

    </div>
  )
}
