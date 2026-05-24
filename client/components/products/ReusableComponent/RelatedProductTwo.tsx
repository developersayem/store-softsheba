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

export default function RelatedProductTwo() {
  const pathname = usePathname();

  const relatedProducts: Product[] = [
    {
      id: 1,
      image:
        "https://shop.softsheba.com/wp-content/uploads/2025/01/wacrm-software-box-300x408.png",
      title: "Whatsapp CRM-All-in-One WhatsApp Business Solution",
      price: "৳2,490.00 – ৳3,990.00",
      sale: true,
      link: "/product/whatsapp-crm-all-in-one-whatsapp-business-solution",
    },
    {
      id: 2,
      image:
        "https://shop.softsheba.com/wp-content/uploads/2023/11/aster-software-box-min-300x408.png",
      title: "Aster Multiseat Software- 1 PC Multiple User",
      price: "৳1,590.00 – ৳10,990.00",
      sale: true,
      link: "/product/aster-multiseat-software",
    },
    {
      id: 3,
      image:
        "https://shop.softsheba.com/wp-content/uploads/2023/08/Invoice-software-min-300x408.png",
      title: "Invoice Software (Multiple License)",
      cutPrice: "৳12,990.00",
      price: "৳9,990.00",
      sale: true,
      link: "/product/invoice-software-lifetime-license",
    },
  ];

  const filteredProducts = relatedProducts.filter(
    (product) => product.link !== pathname
  );

  return (
    <div className="px-10 mx-auto py-18 md:px-14 lg:px-10 xl:px-0 lg:max-w-6xl">
      <h1 className="text-[26px] text-[#333] font-semibold">
        Related Products
      </h1>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-10 mt-3 sm:grid-cols-2 lg:grid-cols-4 justify-items-center">
          {filteredProducts.map((product) => (
            <div key={product.id}>
              
            <Link
              href={product.link}
              
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
                <button className="flex gap-2 ml-3 px-3 cursor-pointer mt-2 py-1 text-[13px] bg-gray-100 border rounded items-center">
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
