"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  image: string;
  products: number;
}

export default function CategoryCard({ category }: { category: Category }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="relative group overflow-hidden rounded-2xl shadow-md bg-white hover:shadow-xl cursor-pointer"
    >
      <div className="relative w-full h-56">
        <Image
          src={category.image}
          alt={category.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="text-sm opacity-80">{category.products} products</p>
      </div>
    </motion.div>
  );
}
