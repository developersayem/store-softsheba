"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { AiOutlineDesktop } from "react-icons/ai";
import { usePathname } from "next/navigation";

type Product = {
  image: string;
  title: string;
  price: string;
  cutPrice?: string;
  review?: number;
  id: number;
  sale: boolean;
  link: string;
};

const relatedProducts: Product[] = [
  {
    id: 1,
    image:
      "https://shop.softsheba.com/wp-content/uploads/2024/03/combo-offer-1-Year-softsheba-ltd-300x408.png",
    title: "Marketing Software Collection | Combo Offer",
    price: "$77.60",
    cutPrice: "$97.00",
    sale: true,
    link: "/product/marketing-software-collection-combo-offer",
  },
  {
    id: 2,
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/10/Linkedin-Extream-min-300x408.png",
    title: "Linkedin Extream | Scrap lead from Linkedin",
    price: "৳3,999.00",
    sale: false,
    link: "/product/linkedin-extream-scrap-lead-from-linkedin",
  },
  {
    id: 3,
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/08/Business-Pro-Whatsapp-Marketing-Software-min-300x408.png",
    title: "Business Pro (WhatsApp Marketing Software)",
    price: "৳690.00 – ৳9,990.00",
    review: 5,
    sale: false,
    link: "/product/business-pro",
  },
  {
    id: 4,
    image:
      "https://shop.softsheba.com/wp-content/uploads/2025/01/wacrm-software-box-300x408.png",
    title: "Whatsapp CRM-All-in-One WhatsApp Business Solution",
    price: "৳2,490.00 – ৳3,990.00",
    sale: true,
    link: "/product/whatsapp-crm-all-in-one-whatsapp-business-solution",
  },
  {
    id: 5,
    image:
      "https://shop.softsheba.com/wp-content/uploads/2024/05/Business-Sender-min-300x408.webp",
    title: "Business Sender - Whatsapp Marketing Software (1 Year)",
    price: "৳1,990.00",
    sale: false,
    link: "/product/business-sender-whatsapp-marketing-software-1-year/",
  },
  {
    id: 6,
    image:
      "https://shop.softsheba.com/wp-content/uploads/2023/08/Email-broadcast-email-marketing-software-softbarta-min-300x408.png",
    title: "Email Broadcast (Email Marketing Software)",
    price: "৳3,990.00 – ৳5,900.00",
    sale: true,
    link: "/product/email-broadcast/",
  },
];

const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function RelatedProducts() {
  const pathname = usePathname();
  const filteredProducts = relatedProducts.filter(
    (product) => product.link.replace(/\/$/, "") !== pathname.replace(/\/$/, "")
  );

  const randomProducts = getRandomItems(filteredProducts, 4);

  return (
    <div className="px-10 mx-auto py-18 md:px-14 lg:px-10 xl:px-0 lg:max-w-6xl">
      <h1 className="text-[26px] text-[#333] font-semibold">
        Related Products
      </h1>

      {randomProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 mt-3 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {randomProducts.map((product) => (
            <div key={product.id}>
              
            <Link
              href={product.link}
              className=""
            >
              <div className="cursor-pointer">
                <Image
                  src={product.image}
                  alt={product.title}
                  width={300}
                  height={408}
                  
                />

          
                {product.sale && (
                  <span className="absolute top-5 left-3 bg-[#ef8661] text-white py-2 px-4 text-sm">
                    Sale
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium text-[#333] line-clamp-2">
                  {product.title}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-sm font-medium text-[#666]">
                  {product.cutPrice && (
                    <div className="line-through">{product.cutPrice}</div>
                  )}
                  {product.price}
                </div>

              </div>
            </Link>
                <button className="ml-3 flex gap-2 px-3 cursor-pointer mt-2 py-1 text-[13px] bg-gray-100 border rounded items-center">
                  Quick view <AiOutlineDesktop />
                </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-gray-600">No related products to show.</p>
      )}
    </div>
  );
}
