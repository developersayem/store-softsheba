import { products } from '@/app/data/products'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { AiOutlineDesktop, AiOutlinePlus } from 'react-icons/ai'
import { FaStar } from 'react-icons/fa'

export default function ShopProducts() {
  return (
    <div className="grid grid-cols-1 gap-3 mt-3 sm:grid-cols-2 md:gap-6 md:grid-cols-3 justify-items-center">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="relative group">
            <div className="relative overflow-hidden cursor-pointer">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={408}
                sizes={
                  "(max-width: 640px) 270"
                }
                className="transition-all w-fill object-cover duration-500 group-hover:opacity-80 rounded group-hover:bg-[#9e9e9e] group-hover:border group-hover:border-[#666]"
              />
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 rounded-full ">
                  <AiOutlinePlus className="text-2xl" />
                </div>
              </div>
              {product.sale && (
                <span className="absolute top-5 left-3 bg-green-500 text-white py-2 px-4 text-base rounded">
                  SALE
                </span>
              )}
            </div>

            <div className="p-3">
              <h3 className="text-sm font-bold text-[#333] line-clamp-2 uppercase">
                {product.name}
              </h3>
              {
                product.reviews ? (
                    <div className='flex my-2 text-[#e09900]'>
                        {
                            [1,2,3,4,5].map(i => (
                                <FaStar key={i} size={12}/>
                            ))
                        }
                    </div>
                ) : null
              }
              <div className="flex items-center gap-2 mt-2 text-base text-green-600 font-bold">
                {product.cutPrice && (
                  <div className="line-through opacity-70">{product.cutPrice}</div>
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
