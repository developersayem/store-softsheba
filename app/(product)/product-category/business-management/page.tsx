"use client";

import Product from "@/components/products/productCategory/Product";
import fethchedByCategory from "@/lib/products/fetchedByCategoy";


export default function BusinessManagementPage() {
  const products = fethchedByCategory("business-management");

  return (
    <div className="max-w-6xl px-6 py-10 mx-auto mt-20 lg:mt-2 xl:mt-0">
      <Product products={products} />
    </div>
  );
}