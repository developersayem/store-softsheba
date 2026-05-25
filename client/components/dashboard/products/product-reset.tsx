"use client";

import { useProductForm } from "@/contexts/product-form-context";
import { useEffect } from "react";

export default function ProductReset() {
  const { clearForm } = useProductForm();

  useEffect(() => {
    clearForm();
  }, [clearForm]);

  return null;
}
