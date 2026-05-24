"use client";

import Product from "@/components/products/productCategory/Product";
import fethchedByCategory from "@/lib/products/fetchedByCategoy";


export default function UncategorizedPage() {
  const products = fethchedByCategory("uncategorized");

  return (
    <div className="max-w-6xl px-6 py-10 mx-auto mt-20 lg:mt-22">
      <Product products={products} />
    </div>
  );
}
