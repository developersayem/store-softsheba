import Link from 'next/link';
import React from 'react'
import { IoIosArrowForward } from 'react-icons/io';
type FooterProduct = {
label: string;
link?: string;
};
export default function FooterProduct() {
    const products: FooterProduct[] = [
  { label: "Business Pro (Whatsapp Marketing Software)", link: "/product/business-pro" },
  { label: "Bulk SMS Gateway", link: "/product/bulk-sms-gateway-with-web-panel-android-app/" },
  { label: "Email Broadcast", link: "/product/email-broadcast/" },
  { label: "Invoice Software", link: "/product/invoice-software-lifetime-license/" },
  { label: "Linkedin Extream", link: "/product/linkedin-extream-scrap-lead-from-linkedin/" },
  { label: "Aster Multiseat Software", link: "/product/aster-multiseat-software/" },
  { label: "Business Sender", link: "/product/business-sender-whatsapp-marketing-software-1-year/" },
  { label: "POS Software", link: "https://pos.softsheba.com/" },
  { label: "Combo Offer", link: "/product/marketing-software-collection-combo-offer/" },
];
  return (
    <div>
        <h5 className='text-lg text-[#333333] font-semibold'>
            Product
        </h5>
        <ul className='px-4 mt-2 space-y-2 text-gray-500 list-disc'>
            {
                products.map((p, i) => (
                    <li key={i}>
                        {
                            p.link ? 

                        <Link href={`${p.link}`}  className='text-[#2ae048]'>
                        {p.label}
                        </Link>:
                        <button className='text-gray-600'>
                            {p.label}
                        </button>
                        }
                    </li>
                ))
            }
        </ul>
         <Link
  href="#"
  className="group bg-[#15b886] text-white border py-2 px-5 rounded-md flex justify-center items-center gap-1 transition-all cursor-pointer mt-4 lg:mt-16 text-base font-bold w-fit"
>
  WEBSITE LAYOUT BUILDER
  <span className="overflow-hidden transition-all duration-300 max-w-0 group-hover:max-w-[20px]">
    <IoIosArrowForward size={20} className="ml-1" />
  </span>
</Link>
    </div>
  )
}
