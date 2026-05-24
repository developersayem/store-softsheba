"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { useState } from "react";
import { products } from "@/lib/products/fetchedByCategoy";
import { AiOutlineDesktop } from "react-icons/ai";
import Image from "next/image";

export default function ProductTagPage() {
  const { tag } = useParams();
  const [sort, setSort] = useState("default");

  const filteredProducts = products.filter((p) =>
    p.tags.some((t) => t.toLowerCase() === (tag as string).toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "priceLowHigh") {
      const aPrice = parseFloat(a.price.replace(/[^\d.-]/g, ""));
      const bPrice = parseFloat(b.price.replace(/[^\d.-]/g, ""));
      return aPrice - bPrice;
    }
    if (sort === "priceHighLow") {
      const aPrice = parseFloat(a.price.replace(/[^\d.-]/g, ""));
      const bPrice = parseFloat(b.price.replace(/[^\d.-]/g, ""));
      return bPrice - aPrice;
    }
    return 0;
  });

  const displayTag = (tag as string).replace(/-/g, " ");
  return (
    <div className="max-w-6xl px-8 py-16 mx-auto mt-20 sm:px-12 md:px-16 lg:px-18 xl:px-0 lg:mt-4 xl:mt-0">
      <div className="max-w-4xl">
        
      <nav className="mb-4 text-[13px] text-[#767676]">
        <Link href="/">Home</Link> /{" "}
        <span>Products tagged “<span className="capitalize">{displayTag}</span>”</span>
      </nav>
      <div className="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-1 text-3xl capitalize">{displayTag}</h1>
          <p className="text-sm text-[#999]">
            Showing {sortedProducts.length} {sortedProducts.length === 1 ? "result" : "results"}
          </p>
        </div>
        <div className="mt-3 sm:mt-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1 text-[12px] text-[#666] bg-[#ececec] border rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
          >
            <option value="default">Default sorting</option>
            <option value="byPupularity">Sort by popularity</option>
            <option value="byAvgRating">Sort by average rating</option>
            <option value="byLatest">Sort by latest</option>

            <option value="priceLowHigh">Sort by price: low to high</option>
            <option value="priceHighLow">Sort by price: high to low</option>
          </select>
        </div>
      </div>

      {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 mt-3 lg:gap-14 sm:grid-cols-3 lg:grid-cols-3 justify-items-center">
        {sortedProducts.map((product) => (
          <Link href={`/product/${product.link}`} key={product.id} className="relative">
            <div className="cursor-pointer">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={408}
                className="object-cover w-fill"
              />
              
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
      ) : (
        <p className="text-lg text-gray-600">No products found for this tag.</p>
      )}
      </div>
    </div>
  );
}
