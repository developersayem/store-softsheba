"use client"
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { AiOutlineDesktop, AiOutlinePlus } from 'react-icons/ai'

interface CategoryProduct {
    id: number;
    image: string;
    link: string;
    name: string;
    price: string;
    cutPrice?: string;
    reviews: number;
    category: string;
    sale: boolean;
}

// type Tools = string

interface ProductProps {
    products: CategoryProduct[];
    // tools: Tools
}

export default function Product({products}: ProductProps) {
  return (
    <div className="grid grid-cols-1 gap-8 mt-3 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {products.map((product) => (
          <Link href={`/product/${product.link}`} key={product.id} className="relative group">
            <div className="relative overflow-hidden cursor-pointer">
              <Image
                src={product.image}
                alt={product.name}
                width={350}
                height={450}
                className="transition-all w-fill object-cover duration-500 group-hover:opacity-15 group-hover:border group-hover:border-[#666]"
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-full ">
                  <AiOutlinePlus className="text-2xl" />
                </div>
              </div>
              {product.sale && (
                <span className="absolute top-5 left-3 bg-[#ef8661] text-white py-2 px-4 text-sm">
                  Sale
                </span>
              )}
            </div>

            <div className="p-3">
              <h3 className="text-sm font-medium text-[#333] line-clamp-2">
                {product.name}
              </h3>

              <div className="flex items-center gap-2 mt-2 text-[12px] font-medium text-[#666]">
                {product.cutPrice && (
                  <div className="line-through">{product.cutPrice}</div>
                )}
                {product.price}
              </div>

              <button className="flex gap-2 px-3 cursor-pointer mt-2 py-1 text-[13px] bg-gray-100 border rounded items-center">
                Quick view <AiOutlineDesktop />
              </button>
            </div>
          </Link>
        ))}
      </div>
  )
}
