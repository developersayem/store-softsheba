"use client";

import { useProductForm } from "@/contexts/product-form-context";
import { IProduct } from "@/types/product.type";
import { useEffect } from "react";

export default function ProductLoader({ data }: { data: IProduct }) {
  const { loadProduct, updateForm } = useProductForm();

  useEffect(() => {
    if (data) {
      loadProduct(data);

      // Ensure discount_type is applied after React's state batching completes.
      // loadProduct sets the full form state, but discount_type can be lost
      // due to React 18 state batching with other effects (e.g., slug generation).
      if (data.discount_type) {
        setTimeout(() => {
          updateForm({ discount_type: data.discount_type as "flat" | "percentage" });
        }, 0);
      }
    }
  }, [data, loadProduct, updateForm]);

  return null;
}
