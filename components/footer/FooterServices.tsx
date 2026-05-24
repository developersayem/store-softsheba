import Image from 'next/image';
import Link from 'next/link'
import React from 'react'
type FooterServices = {
label: string;
link?: string;
};
export default function FooterServices() {
    const services: FooterServices[] = [
  { label: "Web Design & Development", link: "#" },
  { label: "E-Learning (LMS Website)", link: "#" },
  { label: "E-commerce Website" },
  { label: "Portfolio Website", link: "#" },
  { label: "Web Hosting Service", link: "#" },
  { label: "SMM Service", link: "#" },
  { label: "POS Software Solution", link: "#" },
  { label: "Digital Marketing", link: "/product-tag/digital-marketing-tools/" },
  { label: "SEO (Search Engine Optimization)", link: "/seo-search-engine-optimization/" },
];

  return (
    <div>
        <h5 className='text-lg text-[#333333] font-semibold'>
            Services
        </h5>
        <ul className='px-4 mt-2 space-y-2 text-gray-500 list-disc'>
            {
                services.map((s, i) => (
                    <li key={i}>
                        {
                            s.link ? 

                        <Link href={`${s.link}`}  className='text-[#2ae048]'>
                        {s.label}
                        </Link>:
                        <button className='text-gray-600'>
                            {s.label}
                        </button>
                        }
                    </li>
                ))
            }
        </ul>
        <div className='mt-4 lg:mt-12'>
            <Image
            src={`/assets/logo/Payment-gateway-softsheba.png`}
            alt='payment gateway' width={250} height={22}
            className='w-full'/>
           
        </div>
    </div>
  )
}
